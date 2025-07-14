import { DateTime } from 'luxon'
import { Request } from 'express'
import BigNumber from 'bignumber.js'
import { In, Not, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Query } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { DealType } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { POINTS_REASON } from '@app/src/users/points/enums'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { decodeCookieService } from '@app/src/shared/services'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { createUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { calculateDonation } from '@app/src/donations/helper/calculate.helper'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { InventoryService } from '@app/src/sales-history/shipping/inventory.service'
import { InitiateBuynowPaymentDto } from '@app/src/users/payment/modules/initiate/dto'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { ResellingLinkEntity } from '@app/src/users/reselling/entities/reselling.entity'
import { BuyNowPayment } from '@app/src/blockchain/interfaces/signature-payment.interface'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { CryptoConversionService, UserPaymentHelper } from '@app/src/users/payment/services'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { SettingName } from '@app/src/admin/region-settings/enums'

// NEW: import userPointsService
import { UserPointsService } from '@app/src/users/points/user-points.service'

@Injectable()
export class InitiateBuynowPaymentService {
  constructor(
    @InjectRepository(BuynowCartEntity)
    private readonly cartRepository: Repository<BuynowCartEntity>,

    @InjectRepository(UserDealPaymentEntity)
    private readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,

    private readonly cryptoConversionService: CryptoConversionService,
    private readonly blockchainSignatureService: BlockchainService,
    private readonly paymentHelper: UserPaymentHelper,
    private readonly tokensService: TokensService,
    private readonly paymentWalletsService: PaymentWalletsService,
    private readonly inventoryService: InventoryService,

    @InjectRepository(ResellingLinkEntity)
    private readonly resellingLinkRepository: Repository<ResellingLinkEntity>,
    private readonly coinMarketCapService: CoinMarketCapService,
    private readonly regionSettingsService: RegionSettingsService,

    // NEW: add userPointsService injection
    private readonly userPointsService: UserPointsService,
  ) {}

  initiateBuynowPayment = async (
    payload: InitiateBuynowPaymentDto,
    userId: string,
    req: Request,
  ): Promise<SuccessRO> => {
    const existingPayment = await this.userPaymentDealRepository.findOne({
      where: {
        cart: { id: payload.cart },
        status: Not(In([PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.REVERTED])),
      },
      select: { id: true },
    })

    if (existingPayment) {
      throw new BadRequestException(ErrorKey.PAYMENT_ALREADY_EXISTS)
    }

    const cart = await this.cartRepository.findOne({
      where: {
        id: payload.cart,
        status: CartStatus.PENDING,
        user: { id: userId },
      },
      relations: [
        Query.USER,
        Query.SELLER,
        Query.ITEMS,
        `${Query.ITEMS}.${Query.DEAL}`,
        `${Query.ITEMS}.${Query.DEAL}.${Query.USER}`,
        `${Query.ITEMS}.${Query.VARIANT}`,
        `${Query.ITEMS}.${Query.DEAL_DONATION_PROJECT}`,
      ],
    })

    if (!cart) {
      throw new NotFoundException(ErrorKey.INVALID_CART)
    }

    // Decide which token to use (existing logic)
    let paymentCurrencyIdentifier: string
    if (cart.seller.available_tokens.includes(payload.payment_currency)) {
      paymentCurrencyIdentifier = payload.payment_currency
    } else {
      paymentCurrencyIdentifier = cart.seller.prioritised_token
    }

    const tokenInfo: TokenWhitelistEntity =
      await this.tokensService.getTokenInfo(paymentCurrencyIdentifier)
    if (!tokenInfo) {
      throw new NotFoundException(ErrorKey.INVALID_TOKEN)
    }
    const paymentCryptoSymbolForCMC = tokenInfo.name

    // NEW: Check if user wants to redeem points, verify they have enough
    if (payload.points && payload.points > 0) {
      const availablePoints = await this.userPointsService.getAvailablePoints(userId, tokenInfo.id)
      if (availablePoints.isLessThan(new BigNumber(payload.points))) {
        throw new BadRequestException(ErrorKey.INSUFFICIENT_POINTS)
      }
    }

    const { buyerSmartAccount, sellerSmartAccount } =
      await this.paymentWalletsService.getBuyerSellerSmartAccount(userId, cart.seller.id)
    const buyerWallet = await this.paymentWalletsService.getUserWallet(
      userId,
      payload.payment_method,
    )

    let resellingDeals: any = await decodeCookieService(req, 'x-reselling-deals')
    resellingDeals = resellingDeals ? JSON.parse(resellingDeals) : {}

    const region_settings = await this.regionSettingsService.find()
    const targetFiatSymbol = region_settings[SettingName.FIAT_CURRENCY] || 'JPY'

    // Prepare DB entries (existing code)
    const { paymentItems, total_donation_amount, total_deal_amount } = await this.prepareDBEntries(
      cart.items,
      cart.user,
      cart.seller,
      tokenInfo.address,
      cart.id,
      userId,
      resellingDeals,
      targetFiatSymbol,
      paymentCryptoSymbolForCMC,
    )

    // Create the dealPayment object (existing code)
    const dealPayment: UserDealPaymentEntity = this.userPaymentDealRepository.create({
      deal_amount: total_deal_amount,
      gas_fees: BigNumber(0),
      donation_amount: total_donation_amount,
      user: { id: cart.user.id },
      status: PAYMENT_STATUS.INITIATED,
      deal_type: DealType.BUYNOW,
      dex_required: false,
      ramping_required: false,
      items: paymentItems,
      cart: { id: payload.cart },
      buyer_wallet: { id: buyerWallet.id },
      seller_wallet: { id: sellerSmartAccount.id },
      payment_currency: { id: tokenInfo.id },
      points_used: payload.points || 0,
    })

    // Save the dealPayment so we have an ID (existing code)
    await dealPayment.save()

    let finalDealAmountPayableByCrypto = new BigNumber(dealPayment.deal_amount)

    if (payload.points && payload.points > 0) {
      let redeemedPointsValue = new BigNumber(0)
      let actualPointsRedeemedQuantity = new BigNumber(0)

      try {
        const lockResult = await this.userPointsService.lockPointsForDealPayment(
          userId,
          tokenInfo.id,
          new BigNumber(payload.points),
          dealPayment.id,
          this.userPaymentDealRepository.manager,
        )

        redeemedPointsValue = lockResult.redeemedValueInPaymentCurrency
        actualPointsRedeemedQuantity = lockResult.pointsLockedQuantity

        dealPayment.points_used = actualPointsRedeemedQuantity
      } catch (error) {
        throw error
      }

      // Subtract the redeemed value from the total
      finalDealAmountPayableByCrypto = finalDealAmountPayableByCrypto.minus(redeemedPointsValue)

      if (finalDealAmountPayableByCrypto.isLessThan(0)) {
        finalDealAmountPayableByCrypto = new BigNumber(0)
      }

      // Update the DB record to reflect new (reduced) deal amount
      dealPayment.deal_amount = finalDealAmountPayableByCrypto
      await dealPayment.save()
    }

    // Generate signatures (existing code)
    const signatures = await this.generateSignatures(
      dealPayment,
      buyerSmartAccount.address,
      sellerSmartAccount.address,
    )

    // Update cart status to PAID (existing code)
    await this.cartRepository.update(
      { id: cart.id },
      {
        status: CartStatus.PAID,
        purchase_date: DateTime.now().toJSDate(),
      },
    )

    return {
      message: 'Initiated Payment',
      success: true,
      data: {
        transactions: signatures,
        transactionId: dealPayment.id,
        pointsRedeemed: payload.points || 0,
        finalCryptoAmount: finalDealAmountPayableByCrypto.toString(),
      },
    }
  }

  generateSignatures = async (
    dealPayment: UserDealPaymentEntity,
    buyerAddress: string,
    sellerAddress: string,
  ) => {
    const groupedTransactions = await this.groupCurrencies(dealPayment.items)
    const signatures = {}

    for (const currencyTokenAddress in groupedTransactions) {
      const token = await this.tokensService.getTokenInfo(currencyTokenAddress)
      if (!token) {
        continue
      }

      const signature = await this.blockchainSignatureService.signBuyNowPayments(
        groupedTransactions[currencyTokenAddress].payments,
        {
          buyer: buyerAddress,
          seller: sellerAddress,
          token: token.address,
        },
        token.decimals,
      )
      signatures[currencyTokenAddress] = {
        ...groupedTransactions[currencyTokenAddress],
        ...signature,
      }
    }
    return signatures
  }

  groupCurrencies = async (paymentItems: UserDealItemPaymentEntity[]) => {
    const currencies = {}
    for (let i = 0; i < paymentItems.length; i += 1) {
      const item = paymentItems[i]
      const tokenAddress = item.payment_currency.address

      if (!currencies[tokenAddress]) {
        currencies[tokenAddress] = {
          payments: [],
        }
      }
      const { adminShare, donationShare } = await this.cryptoConversionService.getCryptoShares(
        item.deal_amount,
        item.donation_amount,
        item.payment_currency,
      )
      const payment: BuyNowPayment = {
        productId: createUniqueId(item.deal_variant.id),
        price: BigNumber(item.deal_variant.original_price),
        quantity: item.quantity,
        adminShare,
        buyerPoints: item.buyer_points,
        sellerPoints: item.seller_points,
        paymentId: createUniqueId(item.id),
        donationAmount: donationShare,
        nonprofitVault: item.deal.donation_project.vault_address,
      }
      currencies[tokenAddress].payments.push(payment)
    }
    return currencies
  }

  prepareDBEntries = async (
    items: BuynowCartItemEntity[],
    buyer: UserEntity,
    seller: UserEntity,
    paymentCurrencyTokenId: string,
    cartId: string,
    buyerId: string,
    resellingDeals: Record<string, { resellerId: string; resellingLinkId: string }>,
    fiatCurrencySymbolForDb: string,
    paymentCryptoSymbolForCMC: string,
  ) => {
    const paymentItems: UserDealItemPaymentEntity[] = []
    let total_deal_amount = BigNumber(0)
    let total_donation_amount = BigNumber(0)

    for (const cartItem of items) {
      if (cartItem.deal?.user?.account_status !== AccountStatus.ENABLED) {
        throw new BadRequestException(`User [${cartItem.deal.user.id}] is disabled`)
      }
      if (
        cartItem.deal.end_date &&
        new Date(cartItem.deal.end_date).getTime() < new Date().getTime()
      ) {
        throw new BadRequestException(`Deal [${cartItem.deal.id}] is expired`)
      }
      const isAvailable = await this.inventoryService.checkInventoryAvailability(
        cartItem.variant.id,
        Number(cartItem.quantity),
      )
      if (!isAvailable) {
        throw new BadRequestException(ErrorKey.INSUFFICIENT_QUANTITY)
      }

      const dealPrice = cartItem.variant ? cartItem.variant.price : cartItem.deal.starting_price
      const deal_amount_for_item = new BigNumber(cartItem.quantity).multipliedBy(dealPrice)
      total_deal_amount = total_deal_amount.plus(deal_amount_for_item)

      const donation_amount_for_item = calculateDonation(
        cartItem.deal.donation_type,
        cartItem.deal.donation_amount,
        cartItem.quantity,
        dealPrice,
      )
      total_donation_amount = total_donation_amount.plus(donation_amount_for_item)

      let itemConversionRate: BigNumber | null = null
      let itemFiatEquivalentTokenAmount: BigNumber | null = null

      try {
        itemConversionRate = await this.coinMarketCapService.getCryptoToFiatRate(
          paymentCryptoSymbolForCMC,
          fiatCurrencySymbolForDb,
        )
        if (itemConversionRate) {
          itemFiatEquivalentTokenAmount = deal_amount_for_item.dividedBy(itemConversionRate)
        }
      } catch (error) {
        itemConversionRate = null
        itemFiatEquivalentTokenAmount = null
      }

      let resellingLink: ResellingLinkEntity | null = null
      const resellingInfo = resellingDeals[cartItem.deal.id]
      if (resellingInfo && resellingInfo.resellerId !== buyerId) {
        resellingLink = await this.resellingLinkRepository.findOne({
          where: {
            id: resellingInfo.resellingLinkId,
            user: { id: resellingInfo.resellerId },
          },
          select: { id: true },
        })
      }

      const paymentItem: UserDealItemPaymentEntity =
        await this.paymentHelper.createPaymentItemObject({
          deal: cartItem.deal,
          buyer,
          seller,
          quantity: cartItem.quantity,
          deal_amount: deal_amount_for_item,
          donation_amount: donation_amount_for_item,
          payment_currency: paymentCurrencyTokenId,
          deal_variant: cartItem.variant,
          points_note: {
            deal_type: DealType.BUYNOW,
            deal: cartItem.deal.id,
            cart: cartId,
            amount: deal_amount_for_item,
            donation_project: cartItem.deal.donation_project.id,
            is_nonprofit: cartItem.deal.donation_project.status === DonationProjectStatus.DEFAULT,
            reason: POINTS_REASON.DEAL,
          },
          reselling_link: resellingLink ?? undefined,
          fiat_equivalent_token_amount: itemFiatEquivalentTokenAmount,
          conversion_rate_to_fiat: itemConversionRate,
          fiat_currency_symbol: fiatCurrencySymbolForDb,
          payment_currency_symbol: paymentCryptoSymbolForCMC,
        })

      paymentItems.push(paymentItem)
    }

    return {
      paymentItems,
      total_deal_amount,
      total_donation_amount,
    }
  }
}
