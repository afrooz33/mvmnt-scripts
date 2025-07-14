import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ResellingEventEntity } from './entities/reselling-event.entity'
import { ResellingRewardEntity } from './entities/reselling-reward.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import {
  DealAllowReselling,
  DealResellingAmountType,
  DealResellingCap,
} from '@app/src/users/deal/enums'
import { ResellingRewardStatus } from './enums'
import { ResellingRewardMemoEntity } from './entities/reselling-reward-memo.entity'
import { ResellingBannedUserEntity } from './entities/reselling-banned-user.entity'
import {
  addMemoService,
  showMemoService,
  banResellerService,
  rejectRewardService,
  approvePayoutService,
  sellerHistoryService,
  getStarHistoryService,
  getPointHistoryService,
  sellerPaidHistoryService,
  reinstateResellerService,
  showBannedResellerService,
  sellerMonthPaidHistoryService,
} from './services'

@Injectable()
export class ResellingRewardService extends MyService<ResellingRewardEntity> {
  constructor(
    @InjectRepository(ResellingRewardEntity)
    private readonly resellingRewardRepository: Repository<ResellingRewardEntity>,
    @InjectRepository(ResellingRewardMemoEntity)
    private readonly resellingRewardMemoRepository: Repository<ResellingRewardMemoEntity>,
    private readonly configService: ConfigService,
    @InjectRepository(ResellingEventEntity)
    private readonly resellingEventRepository: Repository<ResellingEventEntity>,
    @InjectRepository(ResellingBannedUserEntity)
    private readonly resellingBannedUserRepository: Repository<ResellingBannedUserEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(resellingRewardRepository, 'users/reselling-reward')
  }

  addMemo = addMemoService.bind(this)
  showMemo = showMemoService.bind(this)
  banReseller = banResellerService.bind(this)
  rejectReward = rejectRewardService.bind(this)
  approvePayout = approvePayoutService.bind(this)
  sellerHistory = sellerHistoryService.bind(this)
  getStarHistory = getStarHistoryService.bind(this)
  getPointHistory = getPointHistoryService.bind(this)
  sellerPaidHistory = sellerPaidHistoryService.bind(this)
  reinstateReseller = reinstateResellerService.bind(this)
  showBannedReseller = showBannedResellerService.bind(this)
  sellerMonthPaidHistory = sellerMonthPaidHistoryService.bind(this)

  async calculateRewardForPurchase(
    paymentItem: UserDealItemPaymentEntity,
  ): Promise<{ rewardAmount: number; allowedAmount: number; allowedQuantity: number }> {
    const deal = paymentItem.deal
    const variant = paymentItem.deal_variant
    const itemQuantity = paymentItem.quantity
    const itemTotalAmount = paymentItem.deal_amount.toNumber()

    if (!deal || deal.allow_reselling !== DealAllowReselling.ENABLE) {
      return { rewardAmount: 0, allowedAmount: 0, allowedQuantity: 0 }
    }

    let allowedQuantity = itemQuantity
    let allowedAmount = itemTotalAmount
    const currentDate = new Date()

    switch (deal.reselling_cap) {
      case DealResellingCap.LIMIT_RESELLING_PERIOD:
        const expiredAt = new Date(deal.reselling_cap_value).getTime()
        if (expiredAt < currentDate.getTime()) {
          return { rewardAmount: 0, allowedAmount: 0, allowedQuantity: 0 }
        }
        break

      case DealResellingCap.LIMIT_SALE_AMOUNT_PER_VARIANT:
        if (!variant) return { rewardAmount: 0, allowedAmount: 0, allowedQuantity: 0 }
        const capValueAmount = Number.parseFloat(deal.reselling_cap_value)
        const currentVariantSalesAmount = await this.getCurrentVariantSalesAmount(
          deal.id,
          variant.id,
        )
        const remainingAmount = capValueAmount - currentVariantSalesAmount

        if (remainingAmount <= 0) {
          return { rewardAmount: 0, allowedAmount: 0, allowedQuantity: 0 }
        }
        allowedAmount = Math.min(itemTotalAmount, remainingAmount)
        if (allowedAmount < itemTotalAmount && itemTotalAmount > 0) {
          allowedQuantity = Math.floor((allowedAmount / itemTotalAmount) * itemQuantity)
        }
        break

      case DealResellingCap.LIMIT_SALE_QUANTITY_PER_VARIANT:
        if (!variant) return { rewardAmount: 0, allowedAmount: 0, allowedQuantity: 0 }
        const capValueQuantity = Number.parseInt(deal.reselling_cap_value, 10)
        const currentVariantSalesQuantity = await this.getCurrentVariantSalesQuantity(
          deal.id,
          variant.id,
        )
        const remainingQuantity = capValueQuantity - currentVariantSalesQuantity

        if (remainingQuantity <= 0) {
          return { rewardAmount: 0, allowedAmount: 0, allowedQuantity: 0 }
        }
        allowedQuantity = Math.min(itemQuantity, remainingQuantity)
        if (allowedQuantity < itemQuantity && itemQuantity > 0) {
          const pricePerUnit = itemTotalAmount > 0 ? itemTotalAmount / itemQuantity : 0
          allowedAmount = allowedQuantity * pricePerUnit
        }
        break

      case DealResellingCap.NONE:
      default:
        break
    }

    let rewardAmount = 0
    const fee = Number.parseFloat(deal.reselling_fee)

    switch (deal.reselling_amount_type) {
      case DealResellingAmountType.FIXED_PER_AMOUNT:
        const unitsForReward = 100
        rewardAmount =
          allowedAmount >= unitsForReward ? Math.floor(allowedAmount / unitsForReward) * fee : 0
        break

      case DealResellingAmountType.PERCENTAGE:
        rewardAmount = (allowedAmount * fee) / 100
        break

      default:
        rewardAmount = 0
    }

    rewardAmount = Math.max(0, rewardAmount)

    return { rewardAmount, allowedAmount, allowedQuantity }
  }

  private async getCurrentVariantSalesAmount(dealId: string, variantId: string): Promise<number> {
    const result = await this.resellingRewardRepository
      .createQueryBuilder('reward')
      .select('SUM(reward.purchase_amount)', 'totalAmount')
      .innerJoin('reward.cart_item', 'cart_item')
      .where('reward.dealId = :dealId', { dealId })
      .andWhere('cart_item.dealVariantId = :variantId', { variantId })
      .andWhere('reward.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [
          ResellingRewardStatus.REJECTED,
          ResellingRewardStatus.CANCELLED,
          ResellingRewardStatus.EXPIRED,
          ResellingRewardStatus.RESELLER_BANNED,
        ],
      })
      .getRawOne()

    return Number(result?.totalAmount) || 0
  }

  private async getCurrentVariantSalesQuantity(dealId: string, variantId: string): Promise<number> {
    const result = await this.resellingRewardRepository
      .createQueryBuilder('reward')
      .select('SUM(cart_item.quantity)', 'totalQuantity')
      .innerJoin('reward.cart_item', 'cart_item')
      .where('reward.dealId = :dealId', { dealId })
      .andWhere('cart_item.dealVariantId = :variantId', { variantId })
      .andWhere('reward.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [
          ResellingRewardStatus.REJECTED,
          ResellingRewardStatus.CANCELLED,
          ResellingRewardStatus.EXPIRED,
          ResellingRewardStatus.RESELLER_BANNED,
        ],
      })
      .getRawOne()

    return Number(result?.totalQuantity) || 0
  }
}
