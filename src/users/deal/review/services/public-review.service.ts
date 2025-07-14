import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'

export default async function (query: MyPaginateDto, dealId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealReviewRepository)
      .addFilter('deal', dealId)
      .addRelation(Query.USER)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere('"data"."status" IN (:...review_status)', {
      review_status: [DealRatingStatus.ENABLED, DealRatingStatus.REPORTED],
    })

    results.condition.select([
      '"data"."id"',
      '"data"."description"',
      '"data"."rating"',
      '"data"."created"',
      `(
        SELECT 
          JSON_BUILD_OBJECT(
            'id', "user"."id", 
            'username', "user"."username", 
            'display_name', "user"."display_name", 
            'is_verified', "user"."is_verified", 
            'account_type',"user"."account_type", 
            'profile', JSON_BUILD_OBJECT(
              'id', "profile"."id", 
              'profile_images', JSON_BUILD_OBJECT(
                'id', "profile_images"."id", 
                'url', "profile_images"."url"
              )
            )
          )
      ) user`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
