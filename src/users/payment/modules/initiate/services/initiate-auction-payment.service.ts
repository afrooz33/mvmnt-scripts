import BigNumber from 'bignumber.js'
import { Repository, DataSource } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { createUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { calculateDonation } from '@app/src/donations/helper/calculate.helper'
import { InitiateAuctionPaymentDto } from '@app/src/users/payment/modules/initiate/dto'
import { DealPayment } from '@app/src/blockchain/interfaces/signature-payment.interface'
import { UserPaymentHelper, CryptoConversionService } from '@app/src/users/payment/services'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { POINTS_REASON } from '@app/src/users/points/enums'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { UserPointsService } from '@app/src/users/points/user-points.service'

@Injectable()
export class InitiateAuctionPaymentService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserDealPaymentEntity)
    private readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
    private readonly cryptoConversionService: CryptoConversionService,
    private readonly paymentHelper: UserPaymentHelper,
    private readonly blockchainSignatureService: BlockchainService,
    private readonly tokensService: TokensService,
    private readonly paymentWalletsService: PaymentWalletsService,
    private readonly coinMarketCapService: CoinMarketCapService,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly userPointsService: UserPointsService,
  ) {}

  initiateAuctionPayment = async (
    payload: InitiateAuctionPaymentDto,
    userId: string,
  ): Promise<SuccessRO> => {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Get details of the Bid
      const bid: BidEntity = await queryRunner.manager.findOne(BidEntity, {
        where: {
          id: payload.bid,
          user: { id: userId },
          deal: { deal_type: DealType.AUCTION },
          status: BidStatus.AWARDED,
        },
        relations: [
          Query.USER,
          Query.DEAL,
          `${Query.DEAL}.${Query.SHIPPING_FEE}`,
          `${Query.DEAL}.${Query.USER}`,
          `${Query.DEAL}.${Query.DONATION_PROJECT}`,
        ],
      })

      if (!bid) {
        throw new BadRequestException(ErrorKey.INVALID_BID)
      }

      // 2. Check if payment already exists for the Deal
      const existingPayment = await queryRunner.manager.findOne(UserDealItemPaymentEntity, {
        where: {
          deal: { id: bid.deal.id },
          sender: { id: userId },
          payment: { status: PAYMENT_STATUS.INITIATED },
        },
        relations: ['payment'],
      })

      if (existingPayment) {
        throw new BadRequestException(ErrorKey.PAYMENT_ALREADY_EXISTS)
      }

      // 3: Get buyer and seller's accounts
      const { buyerSmartAccount, sellerSmartAccount } =
        await this.paymentWalletsService.getBuyerSellerSmartAccount(userId, bid.deal.user.id)

      const buyerWallet = await this.paymentWalletsService.getUserWallet(
        userId,
        payload.payment_method,
      )

      // 4: Verify Payment Token
      const paymentToken = await this.tokensService.getTokenInfo(payload.payment_currency)

      if (!paymentToken) {
        throw new NotFoundException(ErrorKey.INVALID_TOKEN)
      }

      // 4.1: Check if user wants to redeem points and has enough
      if (payload.points && payload.points > 0) {
        const availablePoints = await this.userPointsService.getAvailablePoints(
          userId,
          paymentToken.id,
        )
        if (availablePoints.isLessThan(new BigNumber(payload.points))) {
          throw new BadRequestException(ErrorKey.INSUFFICIENT_POINTS)
        }
      }

      // 5: Calculate Deal and Donation amount (initial amounts before point redemption)
      const initial_deal_amount = BigNumber(bid.total_amount).multipliedBy(bid.quantity)
      const donation_amount = BigNumber(
        calculateDonation(
          bid.deal.donation_type,
          bid.deal.donation_amount,
          bid.quantity,
          bid.total_amount,
        ),
      )

      // 6: Create Payment Items inside transaction
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

      const paymentItems = [
        await this.paymentHelper.createPaymentItemObject({
          deal: bid.deal,
          quantity: bid.quantity,
          deal_amount: initial_deal_amount,
          payment_currency: paymentToken.address,
          buyer: bid.user,
          seller: bid.deal.user,
          donation_amount: donation_amount,
          points_note: {
            deal_type: DealType.AUCTION,
            deal: bid.deal.id,
            bid: bid.id,
            amount: initial_deal_amount,
            donation_project: bid.deal.donation_project.id,
            is_nonprofit: bid.deal.donation_project.status === DonationProjectStatus.DEFAULT,
            reason: POINTS_REASON.DEAL,
          },
          conversion_rate_to_fiat: itemConversionRate,
          fiat_currency_symbol: targetFiatSymbol,
          payment_currency_symbol: paymentCryptoSymbolForCMC,
          fiat_equivalent_token_amount: itemFiatEquivalentTokenAmount,
        }),
      ]

      // 7: Store Payment information in Database using QueryRunner
      const dealPayment: UserDealPaymentEntity = queryRunner.manager.create(UserDealPaymentEntity, {
        bid: { id: payload.bid },
        deal_amount: initial_deal_amount,
        gas_fees: BigNumber(0),
        donation_amount: donation_amount,
        user: bid.user,
        status: PAYMENT_STATUS.INITIATED,
        deal_type: DealType.AUCTION,
        ramping_required: false,
        payment_currency: {
          id: paymentToken.id,
        },
        buyer_wallet: {
          id: buyerWallet.id,
        },
        seller_wallet: {
          id: sellerSmartAccount.id,
        },
        items: paymentItems,
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
            userId, // User ID of the buyer
            paymentToken.id,
            new BigNumber(payload.points),
            dealPayment.id,
            queryRunner.manager,
          )
          redeemedValueInPaymentCurrency = lockResult.redeemedValueInPaymentCurrency
          actualPointsRedeemedQuantity = lockResult.pointsLockedQuantity

          dealPayment.points_used = actualPointsRedeemedQuantity // Update with actual points locked
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

      // 8: Convert admin share and donation amount to Payment currency
      // Admin share should be based on the final crypto amount if the fee is on the transacted crypto value.
      // Donation share is based on its own calculated amount.
      const { adminShare, donationShare } = await this.cryptoConversionService.getCryptoShares(
        finalDealAmountPayableByCrypto, // Base admin share on the actual crypto being moved for the deal part
        donation_amount,
        paymentToken,
      )

      // 9: Generate Signature for the payment
      const dealPaymentItem = dealPayment.items[0]

      // Adjust price for signature if contract expects final price per item for crypto portion
      const priceForSignature =
        bid.quantity > 0 && finalDealAmountPayableByCrypto.isGreaterThanOrEqualTo(0)
          ? finalDealAmountPayableByCrypto.dividedBy(bid.quantity)
          : BigNumber(bid.total_amount)

      const paymentForSignature: DealPayment = {
        productId: createUniqueId(dealPaymentItem.deal.id),
        price: priceForSignature,
        quantity: bid.quantity,
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

      const signature = await this.blockchainSignatureService.signAuctionPayment(
        paymentForSignature,
        paymentToken.decimals,
      )

      await queryRunner.commitTransaction()

      return {
        data: {
          ...signature.payment,
          sign: signature.sign,
          transactionId: dealPayment.id,
          pointsRedeemed: actualPointsRedeemedQuantity.toNumber(),
          finalCryptoAmount: finalDealAmountPayableByCrypto.toString(),
        },
        success: true,
        message: 'Payment initiated for Auction',
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      return HandleErrors(error)
    } finally {
      await queryRunner.release()
    }
  }
}
