import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (donationId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.userDonationsRepository)
      .addRelation('user')
      .addRelation('user_donation_payment')
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.payment')
      .addRelation('payment.payment_currency')
      .addRelation('donation_project')
      .addFilter('id', donationId)
      .create()

    results.condition.andWhere('"data"."status" IN (:...donation_status)', {
      donation_status: [DONATION_STATUS.SETTLED, DONATION_STATUS.COMPLETED],
    })

    results.condition.andWhere('"data"."receipt_sent" = :receipt_sent', {
      receipt_sent: false,
    })

    results.condition.select([
      'data.reason',
      'data.created',
      'user.email AS "email"',
      'user.username AS "username"',
      'user.display_name AS "display_name"',
      'SUM("data"."amount") AS "total_donation"',
      'COALESCE(SUM("user_deal_item_payment"."deal_amount"), 0) "deal_amount"',
      'COALESCE(SUM("user_deal_item_payment"."buyer_points"), 0) "total_points"',
      `(SELECT JSON_BUILD_OBJECT(
        'id', "payment_currency"."id",
        'name', "payment_currency"."name",
        'address', "payment_currency"."address",
        'logo_uri', "payment_currency"."logo_uri"
      )) AS "payment_info"`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "donation_project"."id",
            'name', "donation_project"."name",
            'nonprofit_id', "nu"."id",
            'status', "donation_project"."status",
            'profile', JSON_BUILD_OBJECT(
              'id', "np"."id",
              'foundation_name', "np"."foundation_name",
              'foundation_url', "np"."foundation_url",
              'profile_image', JSON_BUILD_OBJECT(
                'id', "i"."id",
                'url', "i"."url"
              )
            )
          )
        FROM
          "nonprofit_users" "nu"
        LEFT JOIN "nonprofit_profiles" "np" ON "np"."userId" = "nu"."id"
        LEFT JOIN "images" "i" ON "i"."id" = "np"."profileImageId"
        WHERE
          "nu"."id" = "donation_project"."userId"
        LIMIT 1
      ) AS "donation_project"`,
      `CASE
        WHEN "data"."reason" = '${DonationType.BUYNOW}' THEN (
          SELECT json_agg(
            json_build_object(
              'name', "deal"."name",
              'variant', json_build_object(
                'id', "items"."variantId",
                'total', "items"."total",
                'shipping_price', COALESCE("items"."shipping_price", 0),
                'shipping_address', json_build_object(
                  'id', "address"."id",
                  'name', "address"."name",
                  'building', "address"."building",
                  'city', "postcode"."city",
                  'state', "postcode"."state",
                  'postcode', "postcode"."postcode",
                  'country', json_build_object(
                    'id', "country"."id",
                    'name', "country"."name"
                  )
                ),
                'option_values', (
                  SELECT json_agg(
                    json_build_object(
                      'id', "ov"."id",
                      'value', "ov"."value",
                      'label_name', "ov"."label_name",
                      'option', json_build_object(
                        'id', "o"."id",
                        'type', "o"."type"
                      )
                    )
                  )
                  FROM "deal_option_values" "ov"
                  JOIN "deal_variants_option_values_deal_option_values" "vov" ON "ov"."id" = "vov"."dealOptionValuesId"
                  JOIN "deal_options" "o" ON "ov"."optionId" = "o"."id"
                  WHERE "vov"."dealVariantsId" = "items"."variantId"
                ),
                'images', (
                  SELECT json_agg(
                    json_build_object(
                      'id', "img"."id",
                      'url', "img"."url"
                    )
                  )
                  FROM "deal_variants_images_images" "vi"
                  LEFT JOIN "images" "img" ON "img"."id" = "vi"."imagesId"
                  WHERE "vi"."dealVariantsId" = "items"."variantId"
                )
              )
            )
          )
          FROM "user_deal_buynow_cart_items" "items"
          JOIN "user_deal_buynow_cart" "cart" ON "cart"."id" = "items"."cartId"
          JOIN "user_addressess" "address" ON "address"."id" = "cart"."deliveryAddressId"
          JOIN "postcodes" "postcode" ON "postcode"."id" = "address"."postcodeId"
          JOIN "countries" "country" ON "country"."id" = "postcode"."countryId"
          JOIN "deals" "deal" ON "deal"."id" = "items"."dealId"
          WHERE "items"."cartId" = "payment"."cartId"
        )
        WHEN "data"."reason" =  '${DonationType.AUCTION}' THEN (
          SELECT
            json_agg(
              json_build_object(
                'name', "d"."name",
                'shipping_address', json_build_object(
                  'id', "address"."id",
                  'name', "address"."name",
                  'building', "address"."building",
                  'city', "postcode"."city",
                  'state', "postcode"."state",
                  'postcode', "postcode"."postcode",
                  'country', json_build_object(
                    'id', "country"."id",
                    'name', "country"."name"
                  )
                )
              )
            )
          FROM "user_deal_item_payment" "item_payment"
          JOIN "deals" "d" ON "d"."id" = "item_payment"."dealId"
          JOIN "user_deal_bids" "bid" ON "bid"."id" = "payment"."bidId"
          LEFT JOIN "user_addressess" "address" ON "address"."id" = "bid"."addressId"
          LEFT JOIN "postcodes" "postcode" ON "postcode"."id" = "address"."postcodeId"
          LEFT JOIN "countries" "country" ON "country"."id" = "postcode"."countryId"
          WHERE "item_payment"."paymentId" = "payment"."id"
          LIMIT 1
        )
        WHEN "data"."reason" = '${DonationType.RAFFLE}' THEN (
          SELECT json_agg(
            json_build_object(
              'name', "d"."name",
              'shipping_address', json_build_object(
                'id', "address"."id",
                'name', "address"."name",
                'building', "address"."building",
                'city', "postcode"."city",
                'state', "postcode"."state",
                'postcode', "postcode"."postcode",
                'country', json_build_object(
                  'id', "country"."id",
                  'name', "country"."name"
                )
              )
            )
          )
          FROM "user_deal_item_payment" "item_payment"
          JOIN "deals" "d" ON "d"."id" = "item_payment"."dealId"
          JOIN "user_deal_raffle_purchases" "purchase" ON "purchase"."id" = "payment"."rafflePurchaseId"
          LEFT JOIN "user_addressess" "address" ON "address"."id" = "purchase"."addressId"
          LEFT JOIN "postcodes" "postcode" ON "postcode"."id" = "address"."postcodeId"
          LEFT JOIN "countries" "country" ON "country"."id" = "postcode"."countryId"
          WHERE "item_payment"."paymentId" = "payment"."id"
          LIMIT 1
        )
        WHEN "data"."reason" IN ('${DonationType.FUNDRAISER_FORM}', '${DonationType.FUNDRAISER_PAGE}') THEN (
          SELECT json_build_object('name', f."title")
          FROM "re2_fundraisers" f
          WHERE f."id" = "user_donation_payment"."reference_id"
            AND f."type"::text = (
              CASE
                WHEN "data"."reason" = '${DonationType.FUNDRAISER_FORM}' THEN '${FundraiserType.FORM}'
                WHEN "data"."reason" = '${DonationType.FUNDRAISER_PAGE}' THEN '${FundraiserType.PAGE}'
              END
            )
        )
        WHEN "data"."reason" IN (
          '${DonationType.INTEGRATION_CART_BANNER}',
          '${DonationType.INTEGRATION_CART_DRAWER}',
          '${DonationType.INTEGRATION_SALES_PORTION}'
        ) THEN (
          SELECT json_build_object('name', integration_settings."name")
          FROM (
            SELECT cb."name" FROM "re2_shopify_cart_banner_settings" cb WHERE cb."id" = "user_donation_payment"."reference_id"
            UNION ALL
            SELECT cd."name" FROM "re2_shopify_cart_drawer_settings" cd WHERE cd."id" = "user_donation_payment"."reference_id"
            UNION ALL
            SELECT sp."name" FROM "re2_shopify_sale_portion_settings" sp WHERE sp."id" = "user_donation_payment"."reference_id"
          ) integration_settings
        )
      END AS "source_info"`,
      `COALESCE(
        "payment"."cartId",
        "payment"."rafflePurchaseId",
        "payment"."bidId",
        "user_donation_payment"."reference_id"
      ) AS "source_id"`,
    ])

    results.condition.groupBy(
      `"source_id",
      "data"."id",
      "user"."id",
      "payment"."cartId",
      "payment"."id",
      "user_donation_payment"."reference_id",
      "donation_project"."id",
      "payment_currency"."id"`,
    )

    results.condition.orderBy('"data"."created"', 'DESC')

    return await results.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
