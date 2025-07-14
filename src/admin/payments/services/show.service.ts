import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryDto } from '@app/src/admin/payments/dto'
import { ICsvAdminPayment, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationTransferStatus } from '@app/src/donations/enums'

export default async function (
  query: QueryDto,
  isExport = false,
): Promise<PaginateRO | ICsvAdminPayment[]> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .create()

    const month_field = `to_char("data"."created", 'YYYY/mm/10')`

    results.condition.select([
      `${month_field} as donation_month`,
      `CASE WHEN COUNT(CASE WHEN "data"."transfer_status" = '${DonationTransferStatus.PENDING}' THEN 1 END) > 0
          THEN true
          ELSE false
        END AS is_pending`,
    ])
    results.condition.groupBy(`${month_field}`)
    results.condition.orderBy(`${month_field}`, 'DESC')

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData: ICsvAdminPayment[] = data.map(this.toCSV)

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
