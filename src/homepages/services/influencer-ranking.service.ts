import { AccountType } from '@app/src/shared/auth/enums'
import { GetRelatedDealsQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/homepages/dto'
import { DealStatus } from '@app/src/users/deal/enums'
import { DonationStatus } from '@app/src/donations/enums'
import { HomepagesEntity } from '@app/src/admin/homepages/entities/homepages.entity'

export default async function (
  _homepage: HomepagesEntity,
  query: QueryDto,
): Promise<QueryBuilderDataInterface> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('donor')
      .addRelation('donor.profile')
      .addRelation('profile.profile_images')
      .addFilter('status', DonationStatus.SUCCESS)
      .useQuery(this.donationsRepository)
      .create()

    results.condition.select([
      'donor.id as user_id',
      'donor.username as username',
      'profile_images.url as profile_image',
      'donor.display_name as display_name',
      `${GetRelatedDealsQuery(`AND "deals"."userId" = "donor"."id"`)} AS "related_deals"`,
    ])

    results.condition.andWhere(
      `"donor"."account_type" IN ('${AccountType.INDIVIDUAL_PERSONAL}', '${AccountType.INDIVIDUAL_INFLUENCER}')`,
    )

    results.condition.addSelect('SUM(data.amount)', 'total_donations')
    results.condition.groupBy('"donor"."id", "profile"."id", "profile_images"."id"')
    results.condition.orderBy('total_donations', 'DESC')

    results.condition.andWhere(
      `(SELECT COUNT("id") FROM "deals" WHERE "userId" = "donor"."id" AND "status" IN (:...deal_status)) > 2`,
      {
        deal_status: [DealStatus.ON_DEAL, DealStatus.ENDED],
      },
    )

    return results
  } catch (error) {
    return HandleErrors(error)
  }
}
