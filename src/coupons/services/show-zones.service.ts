import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ZoneQueryDto } from '@app/src/coupons/dto'

export default async function (query: ZoneQueryDto, userId: string): Promise<any> {
  try {
    let where = 'WHERE "shipping_profiles"."userId" = $1'

    if (query?.keyword) {
      where += ` AND "countries"."name" ILIKE '%${query.keyword}%'`
    }

    const results = await this.entityManager.query(
      `SELECT
        DISTINCT "countryId" AS "id",
        "countries"."name" AS "name"
      FROM
        "shipping_zone_countries"
      LEFT JOIN "countries" ON "shipping_zone_countries"."countryId" = "countries"."id"
      LEFT JOIN "shipping_zones" ON "shipping_zone_countries"."zoneId" = "shipping_zones"."id"
      LEFT JOIN "shipping_profiles" ON "shipping_zones"."shippingProfileId" = "shipping_profiles"."id"
      ${where}`,
      [userId],
    )

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
