import { Query } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ResellingRewardStatus } from '@app/src/users/reselling/enums'

export default async function (query: MyPaginateDto, user: string): Promise<SuccessRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('seller', user)
      .useQuery(this.resellingBannedUserRepository)
      .addRelation(Query.RESELLER)
      .addRelation(`${Query.RESELLER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    // Subquery to calculate the total commission earned by the banned reseller from this seller
    const commissionSubQuery = this.resellingRewardRepository
      .createQueryBuilder('reward')
      .select('SUM(reward.reward_value)', 'total_commission')
      .innerJoin('reward.deal', 'deal')
      .where('reward."userId" = reseller.id')
      .andWhere('deal."userId" = :sellerId', { sellerId: user })
      .andWhere('reward.status = :status', { status: ResellingRewardStatus.ACQUIRED })
      .getQuery()

    results.condition.select([
      '"data"."id" id',
      '"data"."created" banned_date',
      '"reseller".id reseller_id',
      '"reseller"."display_name" reseller_display_name',
      '"reseller"."username" reseller_username',
      '"profile"."id" reseller_profile_id',
      '"profile_images"."url" reseller_profile_image',
      `(${commissionSubQuery}) as commission`,
    ])

    return this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
