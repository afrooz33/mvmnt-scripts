import { In } from 'typeorm'
import { PreconditionFailedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CouponType } from '@app/src/coupons/enums'
import { CreateCouponDto } from '@app/src/coupons/dto'
import { DealStatus } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { GenerateCouponDescription } from '@app/src/coupons/helpers'
import {
  CouponStatus,
  CouponTargetDeal,
  CouponTargetUser,
  CouponTargetCountry,
} from '@app/src/admin/coupons/enums'

export default async function (payload: CreateCouponDto, userId: string): Promise<SuccessRO> {
  try {
    if (
      payload.coupon_type === CouponType.FREE_SHIPPING ||
      payload.coupon_type === CouponType.TOTAL_ORDER
    ) {
      if (payload.deals_variants && payload.deals_variants.length > 0) {
        throw new PreconditionFailedException(ErrorKey.INVALID_COUPON_PAYLOAD)
      }
    }

    if (payload.coupon_type !== CouponType.FREE_SHIPPING) {
      if (payload.is_shipping_fee_excluded || payload.exclude_shipping_fee) {
        throw new PreconditionFailedException(ErrorKey.INVALID_COUPON_PAYLOAD)
      }
    }

    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'email', 'username'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const couponData: any = {
      ...payload,
      user,
    }

    if (payload.target_user === CouponTargetUser.ALL) {
      delete couponData.users
    }

    if (payload.target_deal === CouponTargetDeal.ALL) {
      delete couponData.deals_variants
    }

    if (payload.target_country === CouponTargetCountry.ALL) {
      delete couponData.countries
    }

    if (payload.target_user === CouponTargetUser.TARGET_USERS) {
      const tagetUsers = [...new Set(payload.users)]

      const users = await this.userService.findMany({
        where: {
          id: In(tagetUsers),
          account_status: AccountStatus.ENABLED,
        },
        select: ['id'],
      })

      if (users.length !== tagetUsers.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_COUPON_USERS)
      }

      couponData.users = users
    }

    if (payload.target_deal === CouponTargetDeal.TARGET_DEALS) {
      const payloadDeals = [...new Set(payload.deals_variants.map((deal) => deal.deal))]

      const deals = await this.dealService.findMany({
        where: {
          id: In(payloadDeals),
          status: DealStatus.ON_DEAL,
        },
        select: ['id', 'name'],
      })

      if (deals.length !== payloadDeals.length) {
        throw new PreconditionFailedException(ErrorKey.INVALID_COUPON_DEALS)
      }

      const dealsVariantsCondition = new Set()

      payload.deals_variants.forEach((dealVariant) => {
        if (dealVariant.variant) {
          dealsVariantsCondition.add({
            deal: {
              id: dealVariant.deal,
            },
            id: dealVariant.variant,
          })
        }
      })

      const uniqueDealsVariantsCondition = Array.from(dealsVariantsCondition)

      if (uniqueDealsVariantsCondition.length) {
        const dealsVariants = await this.entityManager.find('deal_variants', {
          where: uniqueDealsVariantsCondition,
          select: ['id', 'deal'],
        })

        if (dealsVariants.length !== uniqueDealsVariantsCondition.length) {
          throw new PreconditionFailedException(
            JSON.stringify({
              key: ErrorKey.INVALID_COUPON_DEALS,
            }),
          )
        }
      }

      couponData.deals_variants = payload.deals_variants.map((dealVariant) => {
        if (
          dealVariant.variant === '' ||
          dealVariant.variant === null ||
          dealVariant.variant === undefined
        ) {
          return {
            deal: {
              id: dealVariant.deal,
            },
          }
        } else {
          return {
            deal: {
              id: dealVariant.deal,
            },
            variant: {
              id: dealVariant.variant,
            },
          }
        }
      })
    }

    if (payload.target_country === CouponTargetCountry.TARGET_COUNTRIES) {
      const targetCountries = [...new Set(payload.countries)]

      const countries = await this.geoService.countryRepository.find({
        where: {
          id: In(targetCountries),
        },
        select: ['id'],
      })

      if (countries.length !== targetCountries.length) {
        throw new PreconditionFailedException(
          JSON.stringify({
            key: ErrorKey.INVALID_COUPON_COUNTRY,
          }),
        )
      }

      couponData.countries = countries
    }

    if (payload.max_usage) {
      couponData.max_usage_per_user = null
    }

    if (payload.max_usage_per_user) {
      couponData.max_usage = null
    }

    if (payload.start_date && new Date(payload.start_date) > new Date()) {
      couponData.status = CouponStatus.SCHEDULED
    }

    couponData.description = await GenerateCouponDescription(couponData)

    const coupon = await this.couponsRepository.create(couponData)

    await this.couponsRepository.save(coupon)

    if (couponData.status === CouponStatus.SCHEDULED) {
      await this.setCouponSchedule(
        coupon.start_date,
        `Enable coupon [${coupon.id}]`,
        coupon,
        CouponStatus.ENABLED,
      )
    }

    if (coupon.end_date && coupon.end_date > new Date()) {
      await this.setCouponSchedule(
        coupon.end_date,
        `Disable coupon [${coupon.id}]`,
        coupon,
        CouponStatus.EXPIRED,
      )
    }

    return {
      success: true,
      message: 'Coupon created successfully',
      data: couponData,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
