import { SuccessRO } from '@app/src/shared/dto'
import { InitiateRafflePaymentDto } from '@app/src/users/payment/modules/initiate/dto'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { MoreThan, Repository, DataSource } from 'typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { ErrorKey, Query } from '@app/src/shared/enums'
import BigNumber from 'bignumber.js'
import { createUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserPaymentHelper, CryptoConversionService } from '@app/src/users/payment/services'
import { DealPayment } from '@app/src/blockchain/interfaces/signature-payment.interface'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { calculateDonation } from '@app/src/donations/helper/calculate.helper'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { POINTS_REASON } from '@app/src/users/points/enums'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

@Injectable()
export class InitiateRafflePaymentService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserDealPaymentEntity)
    private readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    private readonly userPaymentDealItemRepository: Repository<UserDealItemPaymentEntity>,
    private readonly paymentHelper: UserPaymentHelper,
    private readonly cryptoConversionService: CryptoConversionService,
    private readonly blockchainSignatureService: BlockchainService,
    private readonly tokensService: TokensService,
    private readonly paymentWalletsService: PaymentWalletsService,
    @InjectRepository(RafflePurchaseEntity)
    protected readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
    private readonly coinMarketCapService: CoinMarketCapService,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly userPointsService: UserPointsService,
  ) {}

  initiateRafflePayment = async (
    payload: InitiateRafflePaymentDto,
    userId: string,
  ): Promise<SuccessRO> => {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      //  1. Check if payment already exists for the given raffle (within the transaction)
      const existingPayment = await queryRunner.manager.findOne(UserDealItemPaymentEntity, {
        where: {
          quantity: payload.quantity,
          deal: { id: payload.deal },
          sender: { id: userId },
          payment: { status: PAYMENT_STATUS.INITIATED },
        },
        relations: ['payment'],
      })

      if (existingPayment && existingPayment.payment?.status === PAYMENT_STATUS.INITIATED) {
        throw new BadRequestException(ErrorKey.PAYMENT_ALREADY_EXISTS)
      }

      //  2. Verify if Deal is Active
      const deal: DealEntity = await queryRunner.manager.findOne(DealEntity, {
        relations: [
          Query.USER,
          Query.SHIPPING_FEE,
          Query.DONATION_PROJECT,
          Query.DONATION_NONPROFIT,
        ],
        where: {
          id: payload.deal,
          status: DealStatus.ON_DEAL,
          deal_type: DealType.RAFFLE,
          end_date: MoreThan(new Date()),
        },
        select: [
          'id',
          'name',
          'status',
          'user',
          'end_date',
          'deal_type',
          'donation_type',
          'starting_price',
          'donation_amount',
          'donation_project',
          'donation_nonprofit',
        ],
      })

      if (!deal) {
        throw new NotFoundException(ErrorKey.DEAL_NOT_FOUND_OR_EXPIRED)
      }

      if (deal.user.account_status !== AccountStatus.ENABLED) {
        throw new BadRequestException(ErrorKey.DEAL_OWNER_ACCOUNT_DISABLED)
      }

      if (deal.user.id === userId) {
        throw new BadRequestException(ErrorKey.CANNOT_ENTRY_FOR_OWN_DEAL)
      }

      const { buyerSmartAccount, sellerSmartAccount } =
        await this.paymentWalletsService.getBuyerSellerSmartAccount(userId, deal.user.id)

      const buyerWallet = await this.paymentWalletsService.getUserWallet(
        userId,
        payload.payment_method,
      )

      //  4: Get Buyer Details
      const buyer = await queryRunner.manager.findOne(UserEntity, { where: { id: userId } })
      if (!buyer) {
        throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
      }

      //  4.1: Verify Payment Token
      const paymentToken: TokenWhitelistEntity = await this.tokensService.getTokenInfo(
        payload.payment_currency,
      )
      if (!paymentToken) {
        throw new NotFoundException(ErrorKey.INVALID_TOKEN)
      }

      //  4.2: Check if user wants to redeem points and has enough
      if (payload.points && payload.points > 0) {
        const availablePoints = await this.userPointsService.getAvailablePoints(
          userId,
          paymentToken.id,
        )
        if (availablePoints.isLessThan(new BigNumber(payload.points))) {
          throw new BadRequestException(ErrorKey.INSUFFICIENT_POINTS)
        }
      }

      //  5: Calculate Deal and Donation Amount (initial amounts before point redemption)
      const initial_deal_amount = BigNumber(deal.starting_price * payload.quantity)
      const donation_amount = BigNumber(
        calculateDonation(
          deal.donation_type,
          deal.donation_amount,
          payload.quantity,
          deal.starting_price,
        ),
      )

      const paymentCryptoSymbolForCMC = paymentToken.name
      const region_settings = await this.regionSettingsService.find()
      const targetFiatSymbol = region_settings[SettingName.FIAT_CURRENCY] || 'JPY'

      let itemConversionRate: BigNumber | null = null
      let itemFiatEquivalentTokenAmount: BigNumber | null = null

      try {
        itemConversionRate = await this.coinMarketCapService.getCryptoToFiatRate(
          paymentCryptoSymbolForCMC,
          targetFiatSymbol,
        )
        if (itemConversionRate && itemConversionRate.isGreaterThan(0)) {
          itemFiatEquivalentTokenAmount = initial_deal_amount.dividedBy(itemConversionRate)
        }
      } catch (error) {
        itemConversionRate = null
        itemFiatEquivalentTokenAmount = null
      }

      //  6: Create Database objects for Points, Donation, and Payment Item
      const paymentItems = [
        await this.paymentHelper.createPaymentItemObject({
          deal: deal,
          quantity: payload.quantity,
          deal_amount: initial_deal_amount,
          payment_currency: paymentToken.address,
          buyer: buyer,
          seller: deal.user,
          donation_amount: donation_amount,
          points_note: {
            deal_type: DealType.RAFFLE,
            deal: deal.id,
            amount: initial_deal_amount,
            donation_project: deal.donation_project.id,
            is_nonprofit: deal.donation_project.status === DonationProjectStatus.DEFAULT,
            reason: POINTS_REASON.DEAL,
          },
          conversion_rate_to_fiat: itemConversionRate,
          fiat_currency_symbol: targetFiatSymbol,
          payment_currency_symbol: paymentCryptoSymbolForCMC,
          fiat_equivalent_token_amount: itemFiatEquivalentTokenAmount,
        }),
      ]

      //  7: Store Payment information in Database
      const rafflePurchase: RafflePurchaseEntity = queryRunner.manager.create(
        RafflePurchaseEntity,
        {
          raffle_ticket_price: deal.starting_price,
          quantity: payload.quantity,
          deal: { id: deal.id },
          total_amount: initial_deal_amount.toNumber(),
          user: { id: userId },
        },
      )
      await queryRunner.manager.save(RafflePurchaseEntity, rafflePurchase) // Use queryRunner.manager

      const dealPayment: UserDealPaymentEntity = queryRunner.manager.create(UserDealPaymentEntity, {
        deal_amount: initial_deal_amount,
        gas_fees: BigNumber(0),
        donation_amount: donation_amount,
        user: buyer,
        status: PAYMENT_STATUS.INITIATED,
        deal_type: DealType.RAFFLE,
        ramping_required: false,
        payment_currency: { id: paymentToken.id },
        buyer_wallet: { id: buyerWallet.id },
        seller_wallet: { id: sellerSmartAccount.id },
        items: paymentItems,
        raffle_purchase: rafflePurchase,
        points_used: new BigNumber(payload.points || 0),
      })
      await queryRunner.manager.save(UserDealPaymentEntity, dealPayment)

      // 7.1: Lock points if requested and adjust deal_amount
      let finalDealAmountPayableByCrypto = new BigNumber(dealPayment.deal_amount)
      let actualPointsRedeemedQuantity = new BigNumber(0)

      if (payload.points && payload.points > 0) {
        let redeemedValueInPaymentCurrency = new BigNumber(0)
        try {
          const lockResult = await this.userPointsService.lockPointsForDealPayment(
            userId,
            paymentToken.id,
            new BigNumber(payload.points),
            dealPayment.id,
            queryRunner.manager,
          )
          redeemedValueInPaymentCurrency = lockResult.redeemedValueInPaymentCurrency
          actualPointsRedeemedQuantity = lockResult.pointsLockedQuantity

          dealPayment.points_used = actualPointsRedeemedQuantity
        } catch (error) {
          await queryRunner.rollbackTransaction()
          throw error
        }

        finalDealAmountPayableByCrypto = finalDealAmountPayableByCrypto.minus(
          redeemedValueInPaymentCurrency,
        )
        if (finalDealAmountPayableByCrypto.isLessThan(0)) {
          finalDealAmountPayableByCrypto = new BigNumber(0)
        }
        dealPayment.deal_amount = finalDealAmountPayableByCrypto
        await queryRunner.manager.save(UserDealPaymentEntity, dealPayment)
      }

      //  8. Convert admin share and donation amount to Payment currency
      // Admin share should be based on the final crypto amount if the fee is on the transacted crypto value.
      const { adminShare, donationShare } = await this.cryptoConversionService.getCryptoShares(
        finalDealAmountPayableByCrypto,
        donation_amount,
        paymentToken,
      )

      //  9. Generate Signature for the payment
      const dealPaymentItem = dealPayment.items[0]

      const pricePerTicketForSignature =
        payload.quantity > 0 && finalDealAmountPayableByCrypto.isGreaterThanOrEqualTo(0)
          ? finalDealAmountPayableByCrypto.dividedBy(payload.quantity)
          : BigNumber(deal.starting_price)

      const paymentForSignature: DealPayment = {
        productId: createUniqueId(dealPaymentItem.deal.id),
        price: pricePerTicketForSignature,
        quantity: payload.quantity,
        adminShare: adminShare,
        buyer: buyerSmartAccount.address,
        buyerPoints: dealPaymentItem.buyer_points,
        seller: sellerSmartAccount.address,
        sellerPoints: dealPaymentItem.seller_points,
        paymentId: createUniqueId(dealPaymentItem.id),
        token: paymentToken.address,
        donationAmount: donationShare,
        nonprofitVault: dealPaymentItem.deal.donation_project.vault_address,
      }

      const signature = await this.blockchainSignatureService.signRafflePayment(
        paymentForSignature,
        paymentToken.decimals,
      )

      await queryRunner.commitTransaction()

      return {
        data: {
          ...signature.payment,
          sign: signature.sign,
          transactionId: dealPayment.id,
          rafflePurchaseId: rafflePurchase.id,
          paymentItems: dealPayment.items,
          pointsRedeemed: actualPointsRedeemedQuantity.toNumber(),
          finalCryptoAmount: finalDealAmountPayableByCrypto.toString(),
        },
        success: true,
        message: 'Payment initiated for Raffle',
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      return HandleErrors(error)
    } finally {
      await queryRunner.release()
    }
  }
}
