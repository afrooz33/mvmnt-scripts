import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { ListReviewQueryDto } from '@app/src/users/deal/review/dto'
import { DealRatingStatus } from '@app/src/users/deal/review/enums'

export default async function (query: ListReviewQueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealReviewRepository)
      .addRelation(Query.DEAL)
      .addRelation(Query.USER)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere('"data"."status" IN (:...review_status)', {
      review_status: [DealRatingStatus.ENABLED, DealRatingStatus.REPORTED],
    })

    results.condition.andWhere('"deal"."userId" = :user', { user: query.user })

    results.condition.andWhere('"deal"."status" IN (:...deal_status)', {
      deal_status: [DealStatus.ON_DEAL, DealStatus.ENDED],
    })

    results.condition.andWhere('"deal"."deal_type" = :deal_type', {
      deal_type: DealType.BUYNOW,
    })

    results.condition.select([
      'data.id id',
      'data.description description',
      'data.rating rating',
      'data.created created',
      'user.id user_id',
      'user.username username',
      'user.account_type account_type',
      'user.account_status account_status',
      'user.display_name display_name',
      'profile_images.url profile_image',
      'deal.id deal_id',
      'deal.name deal_name',
      'deal.deal_type deal_type',
      `${GetDealFirstImageQuery('deal.deal_type', 'deal.id')}`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
