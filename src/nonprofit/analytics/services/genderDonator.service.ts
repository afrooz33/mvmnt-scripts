import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface, ICsvGenderDonator } from '@app/src/shared/interfaces'
import { CheckNonprofitDonationQuery, GenerateDateRangeFilter } from '@app/src/shared/sql'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'

export default async function (
  query: DateFilterQueryDto,
  userId: string,
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
      condition: ' AND ',
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('user')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere('"data"."status" IN (:...status)', {
      status: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    results.condition.select([
      '"user"."gender" AS gender',
      'COUNT("data"."id") AS "donation_count"',
      'ROUND(COUNT("data"."id") / SUM(COUNT("data"."id")) OVER (), 2) AS "ratio"',
    ])

    results.condition.andWhere(CheckNonprofitDonationQuery('data', userId))

    if (query_condition) {
      results.condition.andWhere(query_condition)
    }

    results.condition.groupBy('"user"."gender"')
    results.condition.orderBy('"donation_count"', 'DESC')

    if (csvExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData: ICsvGenderDonator[] = data.map(this.toCsvGenderDonator)

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
