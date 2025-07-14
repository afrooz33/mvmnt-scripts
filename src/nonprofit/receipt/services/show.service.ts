import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/nonprofit/receipt/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'

export default async function (
  query: QueryDto,
  userId: string,
  isExport = false,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('user')
      .addRelation('user.profile')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere('"data"."status" IN (:...status)', {
      status: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    const result = await this.prepareQuery(results, userId, query)

    if (isExport) {
      const data: [] = await result.condition.getRawMany()

      const csvData = data.map((item: any) => ({
        'Donor ID': item.user_id,
        'Donor Name': item.display_name,
        'Donor Username': item.username,
        'Total Donation': item.total_donation,
        'No. of Donations': item.no_donations,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.receiptPaginate(result)
  } catch (error) {
    return HandleErrors(error)
  }
}
