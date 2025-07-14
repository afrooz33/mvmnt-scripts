import { Query } from '@app/src/shared/enums'
import { GetRelatedDealsQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/homepages/dto'
import { DealStatus } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { ContentSelection } from '@app/src/admin/homepages/enums'
import autoUserMethod from '@app/src/homepages/methods/autoUser.method'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'

export default async function (
  homepage: HomepagesEntity,
  query: QueryDto,
): Promise<QueryBuilderDataInterface> {
  try {
    if (homepage.selection === ContentSelection.AUTO) {
      const results: QueryBuilderDataInterface = new QueryBuilder(query)
        .addRelation('profile')
        .useQuery(this.userRepository)
        .create()

      return await autoUserMethod(homepage, results)
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('homepage', homepage.id)
      .addRelation(Query.USER)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .useQuery(this.homepageContentRepository)
      .create()

    results.condition.select([
      'data.id',
      'user.id as "user_id"',
      'user.username',
      'user.display_name',
      'user.account_type',
      `(SELECT
          "images"."url"
        FROM
          "images"
        WHERE "images"."id" = "profile"."profileImagesId" LIMIT 1) as "profile_image"`,
      `${GetRelatedDealsQuery(`AND "deals"."userId" = "user"."id"`)} AS "related_deals"`,
    ])

    results.condition.andWhere('"data"."userId" IS NOT NULL')
    results.condition.andWhere('"user"."account_status" = :account_status', {
      account_status: AccountStatus.ENABLED,
    })

    results.condition.andWhere(
      `(SELECT COUNT("id") FROM "deals" WHERE "userId" = "data"."userId" AND "status" IN (:...deal_status)) > 2`,
      {
        deal_status: [DealStatus.ON_DEAL, DealStatus.ENDED],
      },
    )

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
