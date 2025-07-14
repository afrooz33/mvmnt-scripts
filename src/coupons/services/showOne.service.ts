import { NotFoundException } from '@nestjs/common'
import {
  CouponTargetDeal,
  CouponTargetUser,
  CouponTargetCountry,
} from '@app/src/admin/coupons/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (id: string, userId: string): Promise<any> {
  try {
    const coupon = await this.couponsRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    })

    if (!coupon) {
      throw new NotFoundException('Coupon not found')
    }

    if (coupon.target_user === CouponTargetUser.TARGET_USERS) {
      coupon.users = await this.entityManager.query(
        `SELECT
          "u"."id",
          "u"."username",
          "u"."display_name",
          "i"."url" as "profile_image"
        FROM
          "coupons_users" "cu"
        LEFT JOIN "users" "u" ON "u"."id" = "cu"."usersId"
        LEFT JOIN "user_profiles" "p" ON "p"."userId" = "u"."id"
        LEFT JOIN "images" "i" ON "i"."id" = "p"."profileImagesId"
        WHERE "cu"."couponsId" = '${id}' AND "u"."account_status" = '${AccountStatus.ENABLED}'`,
      )
    }

    if (coupon.target_deal === CouponTargetDeal.TARGET_DEALS) {
      coupon.deals_variants = await this.entityManager.query(`
        SELECT
          "cdv"."dealId" as "id",
          "d"."name" as "name",
          "d"."deal_type" as "deal_type",
          CASE
            WHEN "cdv"."variantId" IS NULL THEN NULL
            ELSE JSON_BUILD_OBJECT(
              'id', "cdv"."variantId",
              'price', "dv"."price",
              'option_values', (
                SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                  'id', "dov"."id",
                  'value', "dov"."value",
                  'label_name', "dov"."label_name",
                  'option', JSON_BUILD_OBJECT(
                    'id', "do"."id",
                    'type', "do"."type"
                  )
                )), '[]')
                FROM "deal_option_values" "dov"
                JOIN "deal_variants_option_values_deal_option_values" "dvov" ON "dvov"."dealOptionValuesId" = "dov"."id"
                LEFT JOIN "deal_options" "do" ON "do"."id" = "dov"."optionId"
                WHERE "dvov"."dealVariantsId" = "cdv"."variantId"
              ),
              'images', (
                SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('url', "i"."url")), '[]')
                FROM "deal_variants_images_images" "dvii"
                LEFT JOIN "images" "i" ON "i"."id" = "dvii"."imagesId"
                WHERE "dvii"."dealVariantsId" = "cdv"."variantId"
              )
            )
          END as "variant",
          CASE
            WHEN "cdv"."variantId" IS NULL AND "d"."deal_type" = '${DealType.BUYNOW}' THEN (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('url', "i"."url")), '[]')
              FROM "deal_variants_images_images" "dvii"
              LEFT JOIN "deal_variants" "dv" ON "dv"."id" = "dvii"."dealVariantsId" AND "dv"."dealId" = "d"."id"
              LEFT JOIN "images" "i" ON "i"."id" = "dvii"."imagesId"
              WHERE "dvii"."dealVariantsId" = "dv"."id" LIMIT 1
            )
            WHEN "d"."deal_type" = '${DealType.AUCTION}' THEN (
              SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('url', "i"."url")), '[]')
              FROM "deals_images_images" "dii"
              LEFT JOIN "images" "i" ON "i"."id" = "dii"."imagesId"
              WHERE "dii"."dealsId" = "cdv"."dealId"
            )
            ELSE '[]'
          END as "images"
        FROM
          "coupon_deals_variants" "cdv"
        LEFT JOIN "deals" "d" ON "d"."id" = "cdv"."dealId"
        LEFT JOIN "deal_variants" "dv" ON "dv"."id" = "cdv"."variantId"
        WHERE "cdv"."couponId" = '${id}' AND "d"."status" IN ('${DealStatus.ON_DEAL}', '${DealStatus.ENDED}') AND "d"."userId" = '${userId}'
      `)
    }

    if (coupon.target_country === CouponTargetCountry.TARGET_COUNTRIES) {
      coupon.countries = await this.entityManager.query(`
        SELECT
          "c"."id",
          "c"."name"
        FROM
          "coupons_countries" "cc"
        LEFT JOIN "countries" "c" ON "c"."id" = "cc"."countriesId"
        WHERE "cc"."couponsId" = '${id}'
      `)
    }

    return coupon
  } catch (error) {
    return HandleErrors(error)
  }
}
