import { ExportToCsv } from 'export-to-csv'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface, ICsvDonorRanking } from '@app/src/shared/interfaces'
import { CheckNonprofitDonationQuery, GenerateDateRangeFilter } from '@app/src/shared/sql'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'

export default async function (
  query: DateFilterQueryDto,
  userId: string,
): Promise<ICsvDonorRanking> {
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

    const total_donation = `(SELECT COALESCE(SUM("donation"."amount"), 0) FROM "user_donations" "donation" WHERE "donation"."userId" = "donor"."id" AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')${query_condition})`
    const donation_count = `(SELECT COALESCE(COUNT("donation"."id"), 0) FROM "user_donations" "donation" WHERE "donation"."userId" = "donor"."id" AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')${query_condition})`

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('donor')
      .addRelation('donor.profile')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.select([
      'donor.id',
      'donor.username',
      'donor.display_name',
      `${total_donation} AS "total_donation"`,
      `${donation_count} AS "donation_count"`,
    ])

    results.condition.andWhere(CheckNonprofitDonationQuery('data', userId))

    results.condition.groupBy('donor.id, profile.id')
    results.condition.orderBy('total_donation', 'DESC')

    const data: [] = await results.condition.getRawMany()

    const csvData: ICsvDonorRanking[] = data.map(this.toCsvDonorRanking)

    const csvExporter = new ExportToCsv({
      showLabels: true,
      useBom: true,
      useKeysAsHeaders: true,
    })

    return csvExporter.generateCsv(csvData, true)
  } catch (error) {
    return HandleErrors(error)
  }
}
