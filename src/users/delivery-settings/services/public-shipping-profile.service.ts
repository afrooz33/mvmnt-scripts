import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'
import { PublicShippingProfileQueryDto } from '@app/src/users/delivery-settings/dto'

export default async function (query: PublicShippingProfileQueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.shippingProfileRepository)
      .addFilter('status', ShippingProfileStatus.ENABLED)
      .create()

    results.condition.select([
      'id',
      'name',
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "a"."id",
            'name', "a"."name",
            'postcodeId', "p"."id",
            'postcode', "p"."postcode",
            'city', "a"."city",
            'street', "a"."street",
            'building', "a"."building",
            'phone_number', "a"."phone_number",
            'countryId', "c"."id",
            'country', "c"."name"
          )
        FROM
          "shipping_profile_origins" "spo"
        LEFT JOIN "user_addressess" "a" ON "spo"."userAddressessId" = "a"."id"
        LEFT JOIN "postcodes" "p" ON "a"."postcodeId" = "p"."id"
        LEFT JOIN "countries" "c" ON "a"."countryId" = "c"."id"
        WHERE "spo"."shippingProfilesId" = "data"."id") as origin`,
    ])

    results.condition.andWhere('"data"."userId" = :userId', { userId: query.userId })

    return this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
