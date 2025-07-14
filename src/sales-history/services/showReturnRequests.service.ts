import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/sales-history/dto'

export default async function showReturnRequestService(
  query: QueryDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.orderReturnExchangeRepository)
      .addFilter('seller', userId)
      .addRelation('cart')
      .addRelation('bid')
      .addRelation('buyer')
      .addRelation('buyer.profile')
      .addRelation('profile.profile_images')
      .create()

    results.condition.select([
      '"data"."id"',
      '"data"."type"',
      '"data"."status"',
      '"data"."requested_at"',
      '"data"."notes_to_seller"',
      `CASE
        WHEN "data"."cartId" IS NOT NULL THEN "cart"."id"
        WHEN "data"."bidId" IS NOT NULL THEN "bid"."id"
        ELSE NULL
      END as order_id`,
      `CASE
        WHEN "data"."cartId" IS NOT NULL THEN "cart"."purchase_date"
        WHEN "data"."bidId" IS NOT NULL THEN "bid"."purchase_date"
        ELSE NULL
      END as purchase_date`,
      `CASE
        WHEN "data"."cartId" IS NOT NULL THEN "cart"."return_deadline"
        WHEN "data"."bidId" IS NOT NULL THEN "bid"."return_deadline"
        ELSE NULL
      END as return_deadline`,
      `(
        SELECT JSON_BUILD_OBJECT(
          'id', "buyer"."id",
          'display_name', "buyer"."display_name",
          'username', "buyer"."username",
          'profile_image', COALESCE("profile_images"."url", NULL)
        )
      ) buyer`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
