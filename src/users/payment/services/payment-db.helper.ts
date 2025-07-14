import BigNumber from 'bignumber.js'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import getSystemFee from '@app/src/shared/helpers/SystemFee.helper'
import { DealType } from '@app/src/users/deal/enums'
import { POINTS_REASON } from '@app/src/users/points/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { DBHelper } from '@app/src/users/payment/interfaces/dbHelper.interface'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { ResellingLinkEntity } from '@app/src/users/reselling/entities/reselling.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'

@Injectable()
export class UserPaymentHelper {
  constructor(
    @InjectRepository(UserPointsEntity)
    protected readonly userPointsRepository: Repository<UserPointsEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    protected readonly userPaymentDealItemRepository: Repository<UserDealItemPaymentEntity>,
    @InjectRepository(UserDonationsEntity)
    protected readonly userDonationRepository: Repository<UserDonationsEntity>,
    protected readonly tokensService: TokensService,
    protected readonly userPointsService: UserPointsService,
    protected readonly systemFeeService: SystemFeeService,
  ) {}

  // Update the interface or function signature if needed, or handle directly
  async createPaymentItemObject({
    deal,
    buyer,
    seller,
    quantity,
    deal_amount,
    donation_amount,
    payment_currency,
    deal_variant,
    points_note,
    reselling_link,
    conversion_rate_to_fiat,
    fiat_currency_symbol,
    payment_currency_symbol,
    fiat_equivalent_token_amount,
  }: DBHelper & { reselling_link?: ResellingLinkEntity }): Promise<UserDealItemPaymentEntity> {
    const buyerSellerPoints = await this.userPointsService.calculateDealPoints(
      buyer,
      seller,
      deal,
      deal_amount,
    )

    const userPoints = await this.userPointsService.createDBObjects(
      buyer,
      seller,
      buyerSellerPoints,
      payment_currency,
      POINTS_REASON.DEAL,
      points_note,
    )

    const token = await this.tokensService.getTokenInfo(payment_currency)

    const allFees = await this.systemFeeService.findByUserOrDefault(buyer.id)
    const systemFee = getSystemFee(buyer, deal.deal_type, allFees)

    let donationReason: DonationType
    switch (deal.deal_type) {
      case DealType.BUYNOW:
        donationReason = DonationType.BUYNOW
        break
      case DealType.RAFFLE:
        donationReason = DonationType.RAFFLE
        break
      case DealType.AUCTION:
        donationReason = DonationType.AUCTION
        break
    }

    const donation = this.userDonationRepository.create({
      reason: donationReason,
      is_recurring: false,
      user: buyer,
      status: DONATION_STATUS.INITIATED,
      payment_currency: token,
      donation_project: deal.donation_project,
      amount: donation_amount,
      system_fees: systemFee,
    })

    return this.userPaymentDealItemRepository.create({
      points: userPoints,
      sender: buyer,
      receiver: seller,
      deal,
      deal_variant,
      deal_amount,
      quantity,
      status: PAYMENT_STATUS.INITIATED,
      gas_fees: BigNumber(0),
      payment_currency: token,
      donation_type: deal.donation_type,
      donation_value: deal.donation_amount,
      donation_amount,
      donation_project: deal.donation_project,
      donation: donation,
      buyer_points: buyerSellerPoints.buyer.total,
      seller_points: buyerSellerPoints.seller.total,
      reselling_link,
      fiat_equivalent_token_amount,
      conversion_rate_to_fiat,
      fiat_currency_symbol,
      payment_currency_symbol,
    })
  }
}
