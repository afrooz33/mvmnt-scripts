import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.shippingProfileRepository)
      .addFilter('user', userId)
      .addFilter('id', id)
      .addFilter('status', ShippingProfileStatus.ENABLED)
      .create()

    results.condition.select([
      'id',
      'name',
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
                      'name', "countries"."name",
                      'provinces', (
                        SELECT 
                          json_agg(
                            json_build_object(
                              'id', "provinces"."id", 'name', "provinces"."name"
                            )
                          ) 
                        FROM 
                          "shipping_zone_provinces" 
                          LEFT JOIN "provinces" ON "shipping_zone_provinces"."provinceId" = "provinces"."id" 
                        WHERE 
                          "shipping_zone_provinces"."shippingZoneCountryId" = "shipping_zone_countries"."id"
                      )
                    )
                  )
                FROM
                  "shipping_zone_countries"
                LEFT JOIN "countries" ON "shipping_zone_countries"."countryId" = "countries"."id"
                WHERE
                  "shipping_zone_countries"."zoneId" = "zones"."id"
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
    ])

    return {
      success: true,
      message: '',
      data: await results.condition.getRawOne(),
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
