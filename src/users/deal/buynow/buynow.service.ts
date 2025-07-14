import { Cron } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { EntityManager, In, IsNull, LessThanOrEqual, Not, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { DealService } from '@app/src/users/deal/deal.service'
import { DonationsService } from '@app/src/donations/donations.service'
import { WishlistService } from '@app/src/users/wishlist/wishlist.service'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { SystemFeeService } from '@app/src/admin/system-fee/system-fee.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { CouponTargetDeal, CouponTargetUser } from '@app/src/admin/coupons/enums'
import { InventoryService } from '@app/src/sales-history/shipping/inventory.service'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import { ShippingProfilesService } from '@app/src/users/shipping-profiles/shipping-profiles.service'
import {
  showService,
  buyerService,
  createService,
  summaryService,
  markShippedService,
  updateCartQtyService,
  totalItemCountService,
} from './services'
import { CartStatus } from './enums'
import { BuynowCartEntity } from './entities/cart.entity'
import { BuynowCartItemEntity } from './entities/cart-item.entity'

@Injectable()
export class BuynowService extends MyService<BuynowCartEntity> {
  constructor(
    @InjectRepository(BuynowCartEntity)
    public readonly buyNowCartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    public readonly buyNowCartItemRepository: Repository<BuynowCartItemEntity>,
    private readonly dealService: DealService,
    private readonly userService: UserService,
    private readonly notificationsService: NotificationsService,
    private readonly systemFeeService: SystemFeeService,
    private readonly donationsService: DonationsService,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly entityManager: EntityManager,
    private readonly wishlistService: WishlistService,
    private readonly shippingProfileService: ShippingProfilesService, // private readonly couponService: CouponsService,
    private readonly inventoryService: InventoryService,
  ) {
    super(buyNowCartRepository, 'user/deal/buynow/cart')
  }

  /**
   * Check if coupon is valid
   * @param coupon CouponsEntity
   * @param user string
   * @param payload CreateCartDto
   * @returns Promise
   */
  checkCoupon = async (
    coupon: CouponsEntity,
    user: string,
    payload,
  ): Promise<null | CouponsEntity> => {
    if (!coupon) {
      return null
    }
    const now = new Date().getTime()

    if (
      (coupon.end_date && new Date(coupon.end_date).getTime() < now) ||
      (coupon.start_date && new Date(coupon.start_date).getTime() > now)
    ) {
      return null
    }

    const usageConditions = {
      where: {
        coupon: { id: coupon.id },
        status: Not(In([CartStatus.CANCELLED, CartStatus.PENDING])),
      },
    }

    const userUsageConditions = {
      ...usageConditions,
      where: { ...usageConditions.where, user: { id: user } },
    }

    if (coupon.max_usage && coupon.max_usage > 0) {
      const usage = await this.buyNowCartRepository.count(usageConditions)

      if (usage >= coupon.max_usage) {
        return null
      }
    }

    if (coupon.max_usage_per_user && coupon.max_usage_per_user > 0) {
      const usage = await this.buyNowCartRepository.count(userUsageConditions)

      if (usage >= coupon.max_usage_per_user) {
        return null
      }
    }

    if (
      coupon.target_user === CouponTargetUser.TARGET_USERS &&
      !coupon.users.find((u) => u.id === user)
    ) {
      return null
    }

    if (
      coupon.target_deal === CouponTargetDeal.TARGET_DEALS &&
      !coupon.deals_variants.find(
        (deals_variant: any) =>
          deals_variant.deal &&
          deals_variant.deal.id === payload.deal &&
          (deals_variant.variant === null || deals_variant.variant.id === payload.variant),
      )
    ) {
      return null
    }

    return coupon
  }

  show = showService.bind(this)
  buyer = buyerService.bind(this)
  create = createService.bind(this)
  summary = summaryService.bind(this)
  markShipped = markShippedService.bind(this)
  updateCartQty = updateCartQtyService.bind(this)
  totalItemCount = totalItemCountService.bind(this)

  /**
   * @description cron job to remove cart after 15 days
   * @returns Promise
   */
  @Cron('0 0 0 * * *')
  async clearCarts() {
    const guestCarts = await this.buyNowCartRepository.find({
      where: {
        status: CartStatus.PENDING,
        created: LessThanOrEqual(new Date(new Date().getTime() - 86400000 * 15)),
      },
    })

    await Promise.all(
      guestCarts.map(async (c) => {
        await this.buyNowCartRepository.delete({ id: c.id })
      }),
    )

    const userCarts = await this.buyNowCartRepository.find({
      where: {
        user: Not(IsNull()),
        status: CartStatus.PENDING,
        expires_at: LessThanOrEqual(new Date()),
      },
    })

    await Promise.all(
      userCarts.map(async (c) => {
        await this.buyNowCartRepository.delete({ id: c.id })
      }),
    )
  }
}
