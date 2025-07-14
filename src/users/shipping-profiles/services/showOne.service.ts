import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealStatus } from '@app/src/users/deal/enums'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function showOneService(id: string, user: string): Promise<unknown> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.shippingProfileRepository)
      .addFilter('user', user)
      .addFilter('id', id)
      .addFilter('status', ShippingProfileStatus.ENABLED)
      .create()

    results.condition.select([
      'id',
      'name',
      'status',
      'all_deals',
      `CASE WHEN "all_deals" IS NOT true THEN (
        SELECT 
          json_agg(
            json_build_object(
              'id', "deals"."id",
              'name', "deals"."name",
              'deal_type', "deals"."deal_type",
              'deal_image', (
                SELECT
                  "images"."url"
                FROM
                  "deal_variants_images_images" "vi"
                LEFT JOIN "images" ON "images"."id" = "vi"."imagesId"
                LEFT JOIN "deal_variants" ON "deal_variants"."id" = "vi"."dealVariantsId"
                WHERE "deal_variants"."dealId" = "deals"."id"
                LIMIT 1
              ),
              'deal_price', (
                SELECT
                  MIN("deal_variants"."price")
                FROM
                  "deal_variants"
                WHERE
                  "deal_variants"."dealId" = "deals"."id"
              )
            )
          ) 
        FROM 
          "deals" 
        WHERE 
          "deals"."id" IN (
            SELECT 
              "dealsId" 
            FROM 
              "shipping_profile_deals" 
            WHERE 
              "shippingProfilesId" = "data"."id"
          ) AND "deals"."status" != '${DealStatus.DELETED}'
      ) ELSE '[]' END as deals`,
      `CASE WHEN "all_deals" IS NOT true THEN (
        SELECT
          json_agg(
            json_build_object(
              'id', "variants"."id",
              'price', "variants"."price",
              'deal_name', "deals"."name",
              'images', (
                SELECT
                  "i"."url"
                FROM
                  "deal_variants_images_images" "variant_images"
                LEFT JOIN "images" "i" ON "i"."id" = "variant_images"."imagesId"
                WHERE "variant_images"."dealVariantsId" = "variants"."id"
                LIMIT 1
              ),
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
                WHERE "dvov"."dealVariantsId" = "variants"."id"
              )
            )
          )
        FROM
          "deal_variants" "variants"
          LEFT JOIN "deals" ON "variants"."dealId" = "deals"."id"
        WHERE
          "variants"."id" IN (
            SELECT
              "dealVariantsId"
            FROM
              "shipping_profile_variants"
            WHERE
              "shippingProfilesId" = "data"."id"
          ) AND "deals"."status" != '${DealStatus.DELETED}'
      ) ELSE '[]' END as variants`,
      `(SELECT
        json_agg(
          json_build_object(
            'id', "zones"."id",
            'name', "zones"."name",
            'countries', (
              SELECT
                json_agg(
                  json_build_object(
                    'id', "countries"."id",
                    'name', "countries"."name"
                  )
                )
              FROM
                "shipping_zone_countries"
              LEFT JOIN "countries" ON "shipping_zone_countries"."countryId" = "countries"."id"
              WHERE
                "shipping_zone_countries"."zoneId" = "zones"."id"
            ),
            'provinces', (
              SELECT
                json_agg(
                  json_build_object(
                    'id', "provinces"."id",
                    'name', "provinces"."name"
                  )
                )
              FROM
                "shipping_zone_provinces"
              LEFT JOIN "provinces" ON "shipping_zone_provinces"."provinceId" = "provinces"."id"
              LEFT JOIN "shipping_zone_countries" ON "shipping_zone_provinces"."shippingZoneCountryId" = "shipping_zone_countries"."id"
              WHERE
                "shipping_zone_provinces"."shippingZoneCountryId" = "zones"."id"
            ),
            'price', (
              SELECT
                json_agg(
                  json_build_object(
                    'id', "id",
                    'name', "name",
                    'condition_enabled', "condition_enabled",
                    'condition_type', "condition_type",
                    'price', "price",
                    'range', "range"
                  )
                )
              FROM
                "shipping_prices"
              WHERE
                "shipping_prices"."zoneId" = "zones"."id"
            )
          )
        )
      FROM
        "shipping_zones" "zones"
      WHERE
        "zones"."id" IN (
          SELECT
            "id"
          FROM
            "shipping_zones"
          WHERE
            "shippingProfileId" = "data"."id"
        )
      ) as zones`,
      `(
        SELECT
          json_agg(
            json_build_object(
              'id', "user_address"."id",
              'state', "user_address"."state",
              'city', "user_address"."city",
              'street', "user_address"."street",
              'postcode', json_build_object(
                'id', "postcodes"."id",
                'postcode', "postcodes"."postcode"
              ),
              'phone_number', "user_address"."phone_number",
              'building', "user_address"."building",
              'name', "user_address"."name",
              'country', json_build_object(
                'id', "countries"."id",
                'name', "countries"."name",
                'code', "countries"."code"
              )
            )
          )
        FROM
          "shipping_profile_origins"
          LEFT JOIN "user_addressess" "user_address" ON "user_address"."id" = "shipping_profile_origins"."userAddressessId"
          LEFT JOIN "countries" ON "user_address"."countryId" = "countries"."id"
          LEFT JOIN "postcodes" ON "user_address"."postcodeId" = "postcodes"."id"
        WHERE
          "shipping_profile_origins"."shippingProfilesId" = "data"."id"
       ) as origins`,
    ])

    return results.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
