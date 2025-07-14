import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GenerateDateRangeFilter } from '@app/src/shared/sql/common.sql'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface, ICsvGenderDonator } from '@app/src/shared/interfaces'
import { DonationStatus } from '@app/src/donations/enums'
import { AgeGenderFilterQueryDto } from '@app/src/admin/analytics/dto'

export default async function (
  query: AgeGenderFilterQueryDto,
  csvExport = false,
): Promise<PaginateRO | ICsvGenderDonator> {
  try {
    const query_condition = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'data',
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('status', DonationStatus.SUCCESS)
      .addRelation('donor')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.select([
      '"donor"."gender" AS gender',
      'COUNT("data"."id") AS "donation_count"',
      'ROUND(COUNT("data"."id") / SUM(COUNT("data"."id")) OVER (), 2) AS "ratio"',
    ])

    if (query_condition) {
      results.condition.andWhere(query_condition)
    }

    if (query.account_type) {
      results.condition.andWhere('"donor"."account_type" = (:...account_type)', {
        account_type: [query.account_type],
      })
    }

    results.condition.groupBy('"donor"."gender"')
    results.condition.orderBy('"donation_count"', 'DESC')

    if (csvExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData: ICsvGenderDonator[] = data.map((item: any) => ({
        Gender: item.gender,
        'Total donation count': item.donation_count,
        Ratio: item.ratio,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await results.condition.getRawMany()
  } catch (error) {
    return HandleErrors(error)
  }
}
