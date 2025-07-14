import BigNumber from 'bignumber.js'
import { ConfigService } from '@nestjs/config'
import { In, LessThan, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { DealStatus } from '@app/src/users/deal/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { RegisterRecurringDonationDealDto } from '@app/src/recurring-donations/dto'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { generatePaymentIds } from '@app/src/recurring-donations/helper/recurring-blockchain.helper'
import { RecurringDonationSignaturesEntity } from '@app/src/recurring-donations/entities/recurring-donation-signatures.entity'
import { RecurringDonationSettingsEntity } from '@app/src/recurring-donations/entities/recurring-donation-settings.entity'

@Injectable()
export class RegisterRecurringDealService {
  private DONATION_DAY_OF_MONTH: number

  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DealEntity)
    protected readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(TokenWhitelistEntity)
    protected readonly tokenRepository: Repository<TokenWhitelistEntity>,
    @InjectRepository(RecurringDonationSignaturesEntity)
    protected readonly recurringDonationSignaturesRepository: Repository<RecurringDonationSignaturesEntity>,
    @InjectRepository(RecurringDonationSettingsEntity)
    protected readonly recurringDonationSettingsRepository: Repository<RecurringDonationSettingsEntity>,
    @InjectRepository(NotificationEntity)
    protected readonly notificationRepository: Repository<NotificationEntity>,
    private readonly configService: ConfigService,
    private readonly blockchainService: BlockchainService,
    protected readonly paymentWalletsService: PaymentWalletsService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.DONATION_DAY_OF_MONTH = parseInt(this.configService.get('app.recurring.batchSize'))
  }

  registerDeal = async (userId: string, payload: RegisterRecurringDonationDealDto) => {
    //  1: Get Deal details
    const dealDetails = await this.dealRepository.findOne({
      where: {
        id: payload.deal,
        status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
      },
      relations: [Query.DONATION_PROJECT, Query.USER],
      select: {
        id: true,
        name: true,
        donation_amount: true,
        user: {
          id: true,
          username: true,
          display_name: true,
        },
        donation_project: {
          id: true,
          vault_address: true,
        },
      },
    })

    //  2: Validate if Token is whitelisted
    const token = await this.tokenRepository.findOne({
      where: {
        address: payload.currency,
        is_whitelisted: true,
      },
      select: ['address', 'decimals', 'id'],
    })
    if (!token) throw new NotFoundException(ErrorKey.INVALID_TOKEN)

    //  3: Get User's Wallet
    const userWallet = await this.paymentWalletsService.getUserWallet(
      userId,
      payload.payment_method,
    )
    if (!userWallet) throw new NotFoundException(ErrorKey.WALLET_NOT_FOUND)

    //  4: Create Payment Ids and calculate execution time
    const donationAmount = BigNumber(dealDetails.donation_amount).multipliedBy(payload.quantity)

    const { paymentIds, executionTime } = generatePaymentIds(this.DONATION_DAY_OF_MONTH)

    //  5: Generate Merkle Tree and Proof
    const { tree, donationEntries } = this.blockchainService.generateTreeAndData({
      totalMonths: 12,
      paymentIds: paymentIds,
      nonprofitVault: dealDetails.donation_project.vault_address,
      donor: userWallet.address,
      token: token.address,
      precision: token.decimals,
      amount: donationAmount,
      executionScheduledAfter: executionTime,
    })

    //  6: Generate signatures for recurring donation
    const signatures: RecurringDonationSignaturesEntity[] = []
    for (let i = 0; i < donationEntries.length; i += 1) {
      signatures.push(
        this.recurringDonationSignaturesRepository.create({
          id: paymentIds[i],
          unique_id: donationEntries[i].paymentId,
          usage_date: new Date(donationEntries[i].scheduledExecution * 1000),
          merkle_proof: donationEntries[i].proof,
        }),
      )
    }

    // ToDo: change logic to check if recurring donation is updated
    //check if user has already made a recurring donation for this deal
    const existingDonation = await this.recurringDonationSettingsRepository.findOne({
      where: {
        user: { id: userId },
        deal: dealDetails,
        is_active: false,
        updated: LessThan(new Date(Date.now() - 1000 * 60 * 60 * 12)),
      },
    })

    if (existingDonation) {
      this.notificationsService.create({
        user: userId,
        title: 'Recurring Donation Changed',
        message: `Your recurring donation for ${dealDetails.name} has been changed`,
        type: NotificationType.RECURRING_DONATION_CHANGED,
        receiver_type: NotificationReceiverType.USER,
        related_to: NotificationRelatedTo.DEAL,
        data: {
          id: dealDetails.id,
          name: dealDetails.name,
          deal_type: dealDetails.deal_type,
        },
      })
    }

    //  7: Save Recurring Donation in DB
    const recurringDonation = this.recurringDonationSettingsRepository.create({
      user: {
        id: userId,
      },
      deal: dealDetails,
      donation_project: dealDetails.donation_project,
      donation_currency: {
        id: token.id,
      },
      payment_currency: {
        id: token.id,
      },
      donation_value: dealDetails.donation_amount,
      donation_amount: dealDetails.donation_amount * payload.quantity,
      merkle_tree_root: this.blockchainService.getTreeRoot(tree),
      signatures: signatures,
      wallet: {
        id: userWallet.id,
      },
    })
    await recurringDonation.save()

    const notification = this.notificationRepository.create({
      title: 'A recurring donation has been made for your deal',
      user: {
        id: dealDetails.user.id,
      },
      type: NotificationType.RECURRING_DONATION_MADE,
      related_to: NotificationRelatedTo.DEAL,
      receiver_type: NotificationReceiverType.USER,
      data: {
        deal: dealDetails.id,
        deal_name: dealDetails.name,
        username: dealDetails.user.username,
      },
    })
    await notification.save()

    return {
      success: true,
      message: 'Recurring Donation Initiated',
      data: {
        root: this.blockchainService.getTreeRoot(tree),
        firstExecutionScheduled: donationEntries[0].scheduledExecution,
        donationEntries,
      },
    }
  }
}
