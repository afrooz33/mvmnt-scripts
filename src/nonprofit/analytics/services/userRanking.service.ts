import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetProfileImageQuery,
  GenerateDateRangeFilter,
  CheckNonprofitDonationQuery,
} from '@app/src/shared/sql'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'

export default async function (query: DateFilterQueryDto, userId: string): Promise<PaginateRO> {
  try {
    const query_condition = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'donation',
      condition: ' AND ',
    })

    const total_donation = `(SELECT COALESCE(SUM("donation"."amount"), 0) FROM "user_donations" "donation" WHERE "donation"."userId" = "user"."id" AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')${query_condition})`
    const donation_count = `(SELECT COALESCE(COUNT("donation"."userId"), 0) FROM "user_donations" "donation" WHERE "donation"."userId" = "user"."id" AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')${query_condition})`

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('user')
      .addRelation('user.profile')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.select([
      `RANK() OVER (ORDER BY ${total_donation} DESC) AS "rank"`,
      'user.id',
      'user.username',
      'user.account_type',
      'user.display_name',
      'profile.social_accounts',
      `${total_donation} AS "total_donation"`,
      `${donation_count} AS "donation_count"`,
    ])

    results.condition.addSelect(GetProfileImageQuery(), 'profile_images')

    results.condition.andWhere(CheckNonprofitDonationQuery('data', userId))

    results.condition.groupBy('user.id, profile.id')
    results.condition.orderBy('total_donation', 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
