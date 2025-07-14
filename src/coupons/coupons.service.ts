import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { EntityManager, Repository } from 'typeorm'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { MyService } from '@app/src/shared/base'
import { BullMqQuery } from '@app/src/shared/constant'
import { GeoService } from '@app/src/admin/geo/geo.service'
import { CartStatus } from '@app/src/users/deal/buynow/enums'
import { UserAddressType } from '@app/src/users/address/enums'
import { UserService } from '@app/src/users/user/user.service'
import { DealService } from '@app/src/users/deal/deal.service'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowService } from '@app/src/users/deal/buynow/buynow.service'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { Conditions, CouponStatus, CouponTargetCountry, Fields } from '@app/src/admin/coupons/enums'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import {
  showService,
  createService,
  deleteService,
  showOneService,
  validateService,
  getDealsService,
  duplicateService,
  showZonesService,
  applyCodeService,
  setCookieService,
  updateOneService,
  removeCodeService,
  searchUsersService,
  eligibleCouponsService,
  setCouponScheduleService,
  removeCouponScheduleService,
} from './services'

@Injectable()
export class CouponsService extends MyService<CouponsEntity> {
  constructor(
    @InjectRepository(CouponsEntity)
    private readonly couponsRepository: Repository<CouponsEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private readonly dealService: DealService,
    private readonly geoService: GeoService,
    private readonly buynowService: BuynowService,
    private readonly taskSchedulerService: TaskSchedulerService,
    @InjectQueue(BullMqQuery.ADMIN_COUPONS_QUEUE)
    private readonly couponsQueue: Queue,
    @InjectRepository(UserDealPaymentEntity)
    private readonly userDealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(BidEntity)
    private readonly bidRepository: Repository<BidEntity>,
    @InjectRepository(RafflePurchaseEntity)
    private readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
  ) {
    super(couponsRepository, 'coupons')
  }

  async performRawQuery(query): Promise<any> {
    try {
      const result = await this.entityManager.query(query)
      const count = result[0].count

      return count
    } catch (error) {
      throw new Error(`Error executing raw query: ${error.message}`)
    }
  }

  private async checkUserEligibility(
    userId: string,
    field: Fields,
    condition: Conditions,
    values: string,
  ): Promise<boolean> {
    return this.checkUserDealEligibility(userId, field, condition, values)
  }

  private async checkUserDealEligibility(
    userId: string,
    field: Fields,
    condition: Conditions,
    values: string,
  ): Promise<boolean> {
    let query = ''
    let result = 0

    if (field === Fields.DEAL_BRAND && condition === Conditions.CONTAINS) {
      query = `
        SELECT COUNT(*) FROM "brands" AS "B"
        INNER JOIN "deals" AS "D" ON "D"."brandId" = "B"."id" AND "D"."userId" = '${userId}'
        WHERE "B"."name" ILIKE '%${values}%';`

      result = await this.performRawQuery(query)
    }

    if (field === Fields.DEAL_CATEGORY && condition === Conditions.CONTAINS) {
      query = `
        SELECT COUNT(*) FROM "deal_categories" AS "C"
        INNER JOIN "deals" AS "D" ON "D"."categoryId" = "C"."id" AND "D"."userId" = '${userId}'
        WHERE "C"."name" ILIKE '%${values}%';`

      result = await this.performRawQuery(query)
    }

    if (field === Fields.DEAL_NAME) {
      if (condition === Conditions.CONTAINS) {
        query = `
          SELECT COUNT(*) FROM "deals" AS "D"
          WHERE "D"."name" ILIKE '%${values}%' AND "D"."userId" = '${userId}';`
      }

      if (condition === Conditions.DOES_NOT_CONTAIN) {
        query = `
          SELECT COUNT(*) FROM "deals" AS "D"
          WHERE "D"."name" NOT ILIKE '%${values}%' AND "D"."userId" = '${userId}';`
      }

      result = await this.performRawQuery(query)
    }

    if (field === Fields.DEAL_TYPE) {
      if (condition === Conditions.CONTAINS) {
        query = `SELECT COUNT(*) FROM "deals" AS "D"
          WHERE "D"."deal_type" = '${values}' AND "D"."userId" = '${userId}';`
      }

      if (condition === Conditions.DOES_NOT_CONTAIN) {
        query = `SELECT COUNT(*) FROM "deals" AS "D"
          WHERE "D"."deal_type" != '${values}' AND "D"."userId" = '${userId}';`
      }

      result = await this.performRawQuery(query)
    }

    if (field === Fields.USER_TYPE) {
      if (condition === Conditions.CONTAINS) {
        query = `SELECT COUNT(*) FROM "users" AS "U"
          WHERE "U"."account_type" = '${values}' AND "U"."id" = '${userId}';`
      }

      if (condition === Conditions.DOES_NOT_CONTAIN) {
        query = `SELECT COUNT(*) FROM "users" AS "U"
          WHERE "U"."account_type" != '${values}' AND "U"."id" = '${userId}';`
      }

      result = await this.performRawQuery(query)
    }

    if (field === Fields.USER_MVMNT_FOLLOWERS) {
      if (condition === Conditions.IS_GREATER_THAN) {
        query = `SELECT COUNT(*) FROM "followers" AS "F"
          WHERE "F"."follower" > ${values} AND "F"."follower" = '${userId}';`
      }

      if (condition === Conditions.IS_LESS_THAN) {
        query = `SELECT COUNT(*) FROM "followers" AS "F"
          WHERE "F"."follower" < ${values} AND "F"."follower" = '${userId}';`
      }

      result = await this.performRawQuery(query)
    }

    if (field === Fields.DONATED_TO) {
      if (condition === Conditions.CONTAINS) {
        query = `SELECT COUNT(*) FROM "user_donations" AS "D"
          WHERE "D"."donationProjectId" = '${values}' AND "D"."userId" = '${userId}';`
      }

      if (condition === Conditions.DOES_NOT_CONTAIN) {
        query = `SELECT COUNT(*) FROM "user_donations" AS "D"
          WHERE "D"."donationProjectId" != '${values}' AND "D"."userId" = '${userId}';`
      }

      result = await this.performRawQuery(query)
    }

    if (field === Fields.DONATION_AMOUNT) {
      if (condition === Conditions.IS_GREATER_THAN) {
        query = `SELECT COALESCE(SUM("D"."amount"), 0) FROM "user_donations" AS "D"
          WHERE COALESCE("D"."amount", 0) > ${values} AND "D"."userId" = '${userId}';`
      }

      if (condition === Conditions.IS_LESS_THAN) {
        query = `SELECT COALESCE(SUM("D"."amount"), 0) FROM "user_donations" AS "D"
          WHERE COALESCE("D"."amount", 0) < ${values} AND "D"."userId" = '${userId}';`
      }

      result = await this.performRawQuery(query)
    }

    return result > 0
  }

  /**
   * Get coupon usage by user or total
   * @param couponId - The ID of the coupon to check usage for
   * @param userId - The ID of the user to check usage for (optional)
   * @returns The total usage of the coupon by the user or total
   * @description
   * This function is used to get the usage of a coupon by a user or total.
   * It checks the usage of the coupon in bids, raffle purchases, and carts.
   * If a userId is provided, it will only count the usage for that user.
   * Otherwise, it will count the total usage for the coupon.
   */
  async GetTotalCouponUsage(couponId: string, userId?: string): Promise<number> {
    const query = this.userDealPaymentRepository
      .createQueryBuilder('user_deal_payment')
      .leftJoin('user_deal_payment.bid', 'bid')
      .leftJoin('user_deal_payment.raffle_purchase', 'raffle_purchase')
      .leftJoin('user_deal_payment.cart', 'cart')
      .where(
        '"bid"."couponId" = :couponId OR "raffle_purchase"."couponId" = :couponId OR "cart"."couponId" = :couponId',
        { couponId },
      )

    if (userId) {
      query.andWhere('user_deal_payment."userId" = :userId', { userId })
    }

    return await query.getCount()
  }

  /**
   * Get Cart data
   */
  async GetCartData(cartId: string, userId: string): Promise<any> {
    const cartData = await this.entityManager.query(`
      SELECT
        "cart"."id",
        "cart"."sellerId",
        "cart"."couponId",
        "cart"."total",
        "cart"."total_discount",
        "cart"."status",
        "c"."id" "countryId"
      FROM
        "user_deal_buynow_cart" "cart"
      LEFT JOIN "user_addressess" "ua" ON "ua"."id" = "cart"."deliveryAddressId"
      LEFT JOIN "countries" "c" ON "c"."id" = "ua"."countryId"
      WHERE
        "cart"."id" = '${cartId}'
          AND "ua"."type" = '${UserAddressType.DELIVERY}'
          AND "cart"."userId" = '${userId}'
          AND "cart"."status" = '${CartStatus.PENDING}';`)

    if (!cartData.length) {
      throw new ForbiddenException(ErrorKey.INVALID_CART)
    }

    const cart = cartData[0]

    const cartItemBuilder: QueryBuilderDataInterface = new QueryBuilder({})
      .addFilter('cart', cartId)
      .useQuery(this.buynowService.buyNowCartItemRepository)
      .create()

    cartItemBuilder.condition.select([
      'data.id id',
      'data.quantity::int quantity',
      'data.total::float total',
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "dv"."id",
            'deal_id', "d"."id",
            'seller_id', "d"."userId"
          )
        FROM "deal_variants" "dv"
        LEFT JOIN "deals" "d" ON "d"."id" = "dv"."dealId"
        WHERE "dv"."id" = "data"."variantId"::uuid
      ) AS "variant"`,
    ])

    const items = await cartItemBuilder.condition.getRawMany()

    if (!items.length) {
      throw new ForbiddenException(ErrorKey.INVALID_CART)
    }

    return {
      cart,
      items,
    }
  }

  /**
   * Get coupon
   */
  async GetCoupon(code: string): Promise<any> {
    const coupon = await this.documentExists({
      condition: [
        {
          where: {
            code,
            status: CouponStatus.ENABLED,
          },
          relations: [
            Query.USER_SEARCH_CONDITIONS,
            `${Query.COUPON_TARGET_DEAL}.${Query.DEAL}`,
            `${Query.COUPON_TARGET_DEAL}.${Query.VARIANT}`,
          ],
        },
      ],
      errorMessage: ErrorKey.INVALID_COUPON,
    })

    return coupon
  }

  /**
   * Check if coupon is valid for a user address
   */
  async CheckCouponCountry(coupon, countryId: string): Promise<boolean> {
    if (coupon.target_country !== CouponTargetCountry.ALL) {
      if (!coupon.countries.some((c) => c.id === countryId)) {
        throw new ForbiddenException(ErrorKey.INVALID_COUPON_COUNTRY)
      }
    }

    return true
  }

  /**
   * Check coupon validity
   */
  async CheckCouponValidity(coupon, userId: string): Promise<boolean> {
    if (coupon.end_date && new Date(coupon.end_date).getTime() < new Date().getTime()) {
      throw new UnprocessableEntityException(ErrorKey.COUPON_EXPIRED)
    }

    if (coupon.start_date && new Date(coupon.start_date).getTime() > new Date().getTime()) {
      throw new UnprocessableEntityException(ErrorKey.INVALID_COUPON_CODE)
    }

    if (coupon.max_usage && coupon.max_usage > 0) {
      const usage = await this.GetTotalCouponUsage(coupon.id)

      if (usage >= coupon.max_usage) {
        throw new UnprocessableEntityException(ErrorKey.COUPON_MAX_USAGE)
      }
    }

    if (coupon.max_usage_per_user && coupon.max_usage_per_user > 0) {
      const usage = await this.GetTotalCouponUsage(coupon.id, userId)

      if (usage >= coupon.max_usage_per_user) {
        throw new UnprocessableEntityException(ErrorKey.COUPON_MAX_USAGE)
      }
    }

    if (coupon.user_search_conditions.length) {
      const { field, condition, values } = coupon.user_search_conditions

      const isEligible = await this.checkUserEligibility(userId, field, condition, values)

      if (!isEligible) {
        throw new ForbiddenException(ErrorKey.COUPON_NOT_ELIGIBLE)
      }
    }

    return true
  }

  show = showService.bind(this)
  create = createService.bind(this)
  delete = deleteService.bind(this)
  showOne = showOneService.bind(this)
  validate = validateService.bind(this)
  getDeals = getDealsService.bind(this)
  duplicate = duplicateService.bind(this)
  showZones = showZonesService.bind(this)
  setCookie = setCookieService.bind(this)
  updateOne = updateOneService.bind(this)
  applyCode = applyCodeService.bind(this)
  removeCode = removeCodeService.bind(this)
  searchUsers = searchUsersService.bind(this)
  eligibleCoupons = eligibleCouponsService.bind(this)
  setCouponSchedule = setCouponScheduleService.bind(this)
  removeCouponSchedule = removeCouponScheduleService.bind(this)
}
