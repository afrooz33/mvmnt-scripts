import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { randomUUID } from 'node:crypto'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EntityManager, In, LessThanOrEqual, Repository } from 'typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import getDonationFee from '@app/src/shared/helpers/DonationFee.helper'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { AccountStatus } from '@app/src/users/user/enums'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { POINTS_REASON, POINTS_STATUS } from '@app/src/users/points/enums'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { PointsInfo } from '@app/src/users/points/interfaces/points.interface'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { PAYMENT_STATUS, DONATION_SOURCE } from '@app/src/users/payment/enums'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { createUniqueId, uuidFromUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { RecurringDonationSignaturesEntity } from '@app/src/recurring-donations/entities/recurring-donation-signatures.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { DONATION_STATUS, DonationType } from './enums'
import {
  ConfirmDonationDto,
  UpdateDonationHashDto,
  InitiateDirectDonationDto,
  InitiateRecurringDonationDto,
} from './dto'

@Injectable()
export class UserDonationsService extends MyService<UserDonationsEntity> {
  private expiryBatchSize = 100
  private revertDuration: number

  constructor(
    @InjectRepository(UserDonationsEntity)
    private readonly userDonationsRepository: Repository<UserDonationsEntity>,
    @InjectRepository(UserDonationPaymentEntity)
    private readonly userDonationPaymentRepository: Repository<UserDonationPaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DonationProjectEntity)
    private readonly donationProjectRepository: Repository<DonationProjectEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    private readonly dealPaymentItemRepository: Repository<UserDealItemPaymentEntity>,
    @InjectRepository(RecurringDonationSignaturesEntity)
    private readonly recurringDonationSignatureRepository: Repository<RecurringDonationSignaturesEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly paymentWalletsService: PaymentWalletsService,
    private readonly userPointsService: UserPointsService,
    private readonly blockchainService: BlockchainService,
    private readonly tokensService: TokensService,
    private readonly systemFeeService: SystemFeeService,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly coinMarketCapService: CoinMarketCapService,
  ) {
    super(userDonationsRepository, 'user/donation')
    this.revertDuration = parseInt(this.configService.get('blockchain.revertDuration'))
  }

  private async GenerateUniqueDonationCode(retries = 5): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const code = randomUUID().replace(/-/g, '').toUpperCase().slice(0, 32)
        const existing = await this.userDonationsRepository.findOne({
          where: { donation_code: code },
          select: { id: true },
        })

        if (!existing) {
          return code
        }
      } catch (error) {
        if (i === retries - 1) {
          throw new Error('Failed to generate unique donation code')
        }
      }
    }

    throw new Error('Failed to generate unique donation code after multiple retries')
  }

  initiateDirectDonation = async (
    userId: string,
    payload: InitiateDirectDonationDto,
  ): Promise<SuccessRO> => {
    try {
      //  1: Ensure no other payment is active
      const donationPayment = await this.userDonationPaymentRepository.findOne({
        where: {
          donation_project: {
            id: payload.donation_project,
          },
          user: {
            id: userId,
          },
          status: PAYMENT_STATUS.INITIATED,
        },
      })
      if (donationPayment) throw new BadRequestException(ErrorKey.PAYMENT_ALREADY_EXISTS)

      //  2: Validate that the donation project is active
      const donationProject: DonationProjectEntity =
        await this.donationProjectRepository.findOneOrFail({
          where: {
            id: payload.donation_project,
            status: DonationProjectStatus.PUBLISHED,
          },
        })

      //  3: Get User Details
      const user: UserEntity = await this.userRepository.findOne({
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        select: ['id', 'rank', 'account_type'],
      })
      if (!user) throw new NotFoundException(ErrorKey.USER_NOT_FOUND)

      //  4: Get token information for the withdraw currency
      const withdrawToken = await this.tokensService.getTokenInfo(payload.currency)
      if (!withdrawToken?.is_whitelisted) {
        console.error(`[${payload.currency} is not found or not whitelisted]`)
        throw new NotFoundException(ErrorKey.INVALID_CURRENCY)
      }

      //  5: Get donor's smart account and payment wallet
      const userSmartAccount = await this.paymentWalletsService.getUserSmartAccount(userId)
      const userWallet = await this.paymentWalletsService.getUserWallet(
        userId,
        payload.payment_method,
      )

      //  6: Calculate Points based on Rank
      const donationAmount = new BigNumber(payload.amount)
      const userPoints = this.userPointsService.calculateDonationPoints(user, donationAmount)

      //  7: Calculate Platform Fees for the User
      const allFees = await this.systemFeeService.findByUserOrDefault(user.id)
      const systemFee: BigNumber = donationAmount.multipliedBy(
        getDonationFee(donationProject.status, allFees) / 100,
      )

      //  8: Create Database Object for Donation
      /**
       * @description Generate a random code for the donation
       * @description This code is used to identify the donation when user manually integrates the donation from RE2
       */
      const donation_code = await this.GenerateUniqueDonationCode()

      const donation: UserDonationsEntity = this.userDonationsRepository.create({
        reason: DonationType.DIRECT_DONATION,
        is_recurring: false,
        amount: donationAmount,
        user,
        status: DONATION_STATUS.INITIATED,
        donation_project: {
          id: donationProject.id,
        },
        system_fees: systemFee,
        gas_fees: BigNumber(0),
        payment_currency: {
          id: withdrawToken.id,
        },
        donation_code,
      })

      //  9: Store the details in the Database
      const paymentDonation: UserDonationPaymentEntity = await this.storeDonation(
        donation,
        user,
        userPoints,
        userWallet,
        withdrawToken,
        donationAmount,
        payload.donation_project,
        {
          amount: donationAmount,
          donation_project: donationProject.id,
          is_nonprofit: donationProject.status === DonationProjectStatus.DEFAULT,
          reason: POINTS_REASON.DONATION,
          // ToDo: Add other fields if applicable: integration, fundraiser, fundraiser_type
        },
      )

      //  10: Generate a Signature
      const signature = await this.blockchainService.signDonation(
        {
          nonprofitVault: donationProject.vault_address,
          donor: userSmartAccount.address,
          token: withdrawToken.address,
          amount: donationAmount,
          points: userPoints.amount,
          paymentId: createUniqueId(paymentDonation.id),
        },
        withdrawToken.decimals,
      )

      return {
        data: {
          ...signature.donation,
          sign: signature.sign,
          transactionId: paymentDonation.id,
        },
        success: true,
        message: 'Payment initiated for Donation',
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  revertDonation = async (userId: string, paymentDonationId: string): Promise<SuccessRO> => {
    //  1. Ensure the payment belongs to the user and isn't already processed
    const paymentDonation = await this.userDonationPaymentRepository.findOne({
      where: {
        id: paymentDonationId,
        user: {
          id: userId,
        },
        status: PAYMENT_STATUS.INITIATED,
      },
      relations: [Query.POINTS, Query.DONATION],
    })
    if (!paymentDonation) {
      throw new NotFoundException(ErrorKey.DONATION_NOT_FOUND)
    }

    //  2. If there is a transaction Hash, verify the transaction is Reverted on Blockchain
    if (paymentDonation.transaction_hash) {
      try {
        const blockchainVerified = await this.blockchainService.isTransactionReverted(
          paymentDonation.transaction_hash,
        )
        if (!blockchainVerified) throw new BadRequestException(ErrorKey.TRANSACTION_NOT_REVERTED)
      } catch (error) {
        throw new BadRequestException(ErrorKey.TRANSACTION_HASH_INVALID)
      }
    }

    //  3. Revert all Points
    for (const point of paymentDonation.points) {
      point.status = POINTS_STATUS.REVERTED
    }

    //  4. Revert Donation and Payment
    paymentDonation.donation.status = DONATION_STATUS.REVERTED
    paymentDonation.status = PAYMENT_STATUS.REVERTED

    await paymentDonation.save()

    return {
      success: true,
      message: 'Payment reverted successfully',
      data: paymentDonationId,
    }
  }

  revertExpiredDonations = async () => {
    const expiry = new Date().getTime() - this.revertDuration * 1000

    while (true) {
      //  1: Get all the Payment Donations that are to be expired
      const paymentDonations = await this.userDonationPaymentRepository.find({
        where: {
          status: PAYMENT_STATUS.INITIATED,
          created: LessThanOrEqual(new Date(expiry)),
        },
        select: {
          id: true,
        },
        take: this.expiryBatchSize,
      })

      if (paymentDonations.length === 0) return

      const paymentDonationIds = paymentDonations.map((payment) => payment.id)

      await this.entityManager.transaction(async (transaction) => {
        //  2: Revert points
        await this.userPointsService.revertPaymentDonationPoints(paymentDonationIds, transaction)
        //  3: Revert Donation
        await transaction.update(
          UserDonationsEntity,
          {
            user_donation_payment: {
              id: In(paymentDonationIds),
            },
          },
          {
            status: DONATION_STATUS.REVERTED,
          },
        )
        //  4: Revert Donation Payment
        await transaction.update(
          UserDonationPaymentEntity,
          {
            id: In(paymentDonationIds),
          },
          {
            status: PAYMENT_STATUS.REVERTED,
          },
        )
      })
    }
  }

  revertPaymentItemDonations = async (paymentItems: string[], transaction: EntityManager) => {
    await transaction.update(
      UserDonationsEntity,
      {
        user_deal_item_payment: {
          id: In(paymentItems),
        },
      },
      {
        status: DONATION_STATUS.REVERTED,
      },
    )
  }

  confirmDonation = async (payload: ConfirmDonationDto) => {
    switch (payload.type) {
      case 1:
        await this.confirmDealDonation(payload)
        break
      case 2:
        await this.confirmDirectDonation(payload)
        break
      case 3:
        await this.confirmRecurringDonation(payload)
        break
    }
  }

  confirmRecurringDonation = async (payload: ConfirmDonationDto) => {
    //  1: Find the Donation signature
    const donationSignature = await this.recurringDonationSignatureRepository.findOne({
      where: {
        id: uuidFromUniqueId(payload.payment_id),
      },
      relations: { payment: { user: true }, setting: { deal: true } },
    })

    //  2: Update Transaction Hash for Donation Payment
    donationSignature.payment.transaction_hash = payload.transaction_hash
    await donationSignature.save()

    const notification = this.notificationRepository.create({
      title: 'Reccuring Donation has been made on your deal',
      user: {
        id: donationSignature.payment.user.id,
      },
      type: NotificationType.RECURRING_DONATION_CHARGED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        deal: donationSignature.setting.deal.id,
        deal_name: donationSignature.setting.deal.name,
        username: donationSignature.payment.user.username,
      },
    })

    await notification.save()

    //  3: Confirm the donation
    await this.confirmDirectDonation(payload)
  }

  confirmDealDonation = async (payload: ConfirmDonationDto) => {
    //  1: Find the payment Item
    const paymentItem = await this.dealPaymentItemRepository.findOne({
      where: {
        id: uuidFromUniqueId(payload.payment_id),
      },
      relations: {
        donation: true,
        payment_currency: true,
      },
    })

    if (!paymentItem) {
      console.error(`[${payload.payment_id}] = [${uuidFromUniqueId(payload.payment_id)}] not found`)
      throw new NotFoundException(ErrorKey.DONATION_NOT_FOUND)
    }

    //  2: Update unsettled amount and admin share for the donation
    const unsettledAmount = ethers.formatUnits(
      payload.unsettled_amount,
      paymentItem.payment_currency.decimals,
    )
    const adminShare = await this.calculateAdminShare(
      paymentItem.payment_currency,
      paymentItem.gas_fees.dividedBy(3),
      paymentItem.donation.system_fees,
    )

    paymentItem.donation.unsettled_amount = BigNumber(unsettledAmount)
    paymentItem.donation.admin_share = adminShare

    await paymentItem.save()
  }

  calculateAdminShare = async (
    token: TokenWhitelistEntity,
    gasFees: BigNumber,
    systemFees: BigNumber,
  ): Promise<BigNumber> => {
    //  1: Get addresses of all required tokens
    const ethToken = this.tokensService.getETHToken()
    const baseToken = this.tokensService.getBaseToken()

    //  2: Convert GAS Fees to Payment token
    const gasToken: BigNumber = new BigNumber(
      await this.coinMarketCapService.convertToken(ethToken, token, gasFees),
    )

    //  3: Convert System Fees to Payment Token
    const systemToken: BigNumber = new BigNumber(
      await this.coinMarketCapService.convertToken(baseToken, token, systemFees),
    )

    return gasToken.plus(systemToken)
  }

  confirmDirectDonation = async (payload: ConfirmDonationDto) => {
    try {
      //  1. Find the Donation for confirmation
      const paymentDonation = await this.userDonationPaymentRepository.findOne({
        where: {
          id: uuidFromUniqueId(payload.payment_id),
        },
        relations: {
          points: true,
          donation: true,
          currency: true,
        },
      })
      if (!paymentDonation) {
        console.error(
          `[${payload.payment_id}] = [${uuidFromUniqueId(payload.payment_id)}] not found`,
        )
        throw new NotFoundException(ErrorKey.DONATION_NOT_FOUND)
      }

      //  2. Update Gas Fees and Admin Share
      let gasFees: BigNumber = BigNumber(0)
      if (paymentDonation.transaction_hash) {
        gasFees = await this.blockchainService.getGasFees(paymentDonation.transaction_hash)
      }
      const adminShare = await this.calculateAdminShare(
        paymentDonation.currency,
        gasFees.dividedBy(2),
        paymentDonation.donation.system_fees,
      )

      paymentDonation.gas_fees = gasFees
      paymentDonation.donation.gas_fees = gasFees
      paymentDonation.donation.admin_share = adminShare

      //  3. Unlock all Points
      for (const point of paymentDonation.points) {
        point.status = POINTS_STATUS.UNLOCKED
      }

      //  4. Confirm Donation and Payment
      const unsettledAmount = ethers.formatUnits(
        payload.unsettled_amount,
        paymentDonation.currency.decimals,
      )
      paymentDonation.donation.unsettled_amount = BigNumber(unsettledAmount)
      paymentDonation.donation.status = DONATION_STATUS.COMPLETED
      paymentDonation.status = PAYMENT_STATUS.COMPLETED

      await paymentDonation.save()

      //  5: Add stars
      this.eventEmitter.emit('user.award.donation.stars', paymentDonation.id)

      return {
        success: true,
        message: 'Payment completed successfully',
        data: payload.payment_id,
      }
    } catch (error) {
      console.error(error)
      return HandleErrors(error)
    }
  }

  updateTransactionHash = async (
    payload: UpdateDonationHashDto,
    userId: string,
  ): Promise<SuccessRO> => {
    //  1. Find the Donation, verify it belongs to the user
    const paymentDonation = await this.userDonationPaymentRepository.findOne({
      where: {
        id: payload.transaction,
        user: {
          id: userId,
        },
      },
      relations: [Query.POINTS, Query.DONATION],
    })
    if (!paymentDonation) {
      console.error(`[${payload.transaction}] not found for User [${userId}]`)
      throw new NotFoundException(ErrorKey.DONATION_NOT_FOUND)
    }

    //  2. Verify if Transaction Hash already been updated
    if (paymentDonation.transaction_hash != null) {
      throw new BadRequestException(ErrorKey.TRANSACTION_HASH_ALREADY_UPDATED)
    }

    //  3. Update the Transaction Hash
    paymentDonation.transaction_hash = payload.transaction_hash
    await paymentDonation.save()

    return {
      success: true,
      message: 'Transaction Hash updated',
      data: payload,
    }
  }

  storeDonation = async (
    donation: UserDonationsEntity,
    user: UserEntity,
    points: PointsInfo,
    userWallet: PaymentWalletsEntity,
    withdrawToken: TokenWhitelistEntity,
    donationAmount: BigNumber,
    donationProject: string,
    point_notes: object = {},
  ) => {
    //  1: Create Database Objects for Points
    const pointEntries = await this.userPointsService.createDBObjects(
      user,
      null,
      {
        buyer: {
          points: [points],
          total: points.amount,
        },
        seller: null,
      },
      withdrawToken,
      POINTS_REASON.DONATION,
      point_notes,
    )

    //  2: Store the details in the Database
    const donationPayment = this.userDonationPaymentRepository.create({
      donation_project: {
        id: donationProject,
      },
      gas_fees: BigNumber(0),
      user: {
        id: user.id,
      },
      source: DONATION_SOURCE.DIRECT,
      donation: donation,
      points: pointEntries,
      donation_amount: donationAmount,
      status: PAYMENT_STATUS.INITIATED,
      currency: {
        id: withdrawToken.id,
      },
      user_points: points.amount,
      donor_wallet: {
        id: userWallet.id,
      },
    })

    await donationPayment.save()

    return donationPayment
  }

  initiateRecurringDonation = async (
    userId: string,
    payload: InitiateRecurringDonationDto,
    uniquePaymentId: string,
  ): Promise<SuccessRO> => {
    try {
      //  1: Validate that the donation project is active
      const donationProject: DonationProjectEntity =
        await this.donationProjectRepository.findOneOrFail({
          where: {
            id: payload.donation_project,
            status: DonationProjectStatus.PUBLISHED,
          },
        })

      //  2: Get User Details
      const user: UserEntity = await this.userRepository.findOne({
        where: {
          id: userId,
          account_status: AccountStatus.ENABLED,
        },
        select: {
          id: true,
          rank: true,
          account_type: true,
        },
      })
      if (!user) throw new NotFoundException(ErrorKey.USER_NOT_FOUND)

      //  3: Get token information for the withdraw currency
      const withdrawToken = await this.tokensService.getTokenInfo(payload.currency)
      if (!withdrawToken?.is_whitelisted) {
        console.error(`[${payload.currency} is not found or not whitelisted]`)
        throw new NotFoundException(ErrorKey.INVALID_CURRENCY)
      }

      //  4: Get donor's smart account and payment wallet
      const userSmartAccount = await this.paymentWalletsService.getUserSmartAccount(userId)
      const userWallet = await this.paymentWalletsService.getUserWallet(
        userId,
        payload.payment_method,
      )

      //  5: Calculate Points based on Rank
      const donationAmount = new BigNumber(payload.amount)
      const userPoints = this.userPointsService.calculateDonationPoints(user, donationAmount)

      //  6: Calculate Platform Fees for the User
      const allFees = await this.systemFeeService.findByUserOrDefault(user.id)
      const systemFee: BigNumber = donationAmount.multipliedBy(
        getDonationFee(donationProject.status, allFees) / 100,
      )

      //  7: Create Database Object for Donation
      const donation: UserDonationsEntity = this.userDonationsRepository.create({
        recurring_signature: {
          id: payload.signature,
        },
        reason: payload.reason,
        is_recurring: true,
        amount: donationAmount,
        user,
        status: DONATION_STATUS.INITIATED,
        donation_project: {
          id: donationProject.id,
        },
        system_fees: systemFee,
        gas_fees: BigNumber(0),
        payment_currency: {
          id: withdrawToken.id,
        },
      })

      //  7: Store the details in the Database
      const paymentDonation: UserDonationPaymentEntity = await this.storeDonation(
        donation,
        user,
        userPoints,
        userWallet,
        withdrawToken,
        donationAmount,
        payload.donation_project,
        {
          amount: donationAmount,
          donation_project: donationProject.id,
          is_nonprofit: donationProject.status === DonationProjectStatus.DEFAULT,
          reason: payload.reason,
          // ToDo: Add other fields if applicable: integration, fundraiser, fundraiser_type
        },
      )

      //  8: Generate a Signature
      const signature = await this.blockchainService.signDonation(
        {
          nonprofitVault: donationProject.vault_address,
          donor: userSmartAccount.address,
          token: withdrawToken.address,
          amount: donationAmount,
          points: userPoints.amount,
          paymentId: uniquePaymentId || createUniqueId(paymentDonation.id),
        },
        withdrawToken.decimals,
      )

      return {
        data: {
          ...signature.donation,
          sign: signature.sign,
          transactionId: paymentDonation.id,
        },
        success: true,
        message: 'Payment initiated for Donation',
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
