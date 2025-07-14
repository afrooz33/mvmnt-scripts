import { ExportToCsv } from 'export-to-csv'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { GetDonationProjectDonationQuery } from '@app/src/shared/sql'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface, ICsvNonprofitDonationProject } from '@app/src/shared/interfaces'
import { QueryDto } from '@app/src/nonprofit/donation-projects/dto'

export default async function (
  query: QueryDto,
  userId: string,
  isExport: boolean = false,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('user', userId)
      .useQuery(this.donationProjectRepository)
      .create()

    const total_donation = `(${GetDonationProjectDonationQuery('data')})`

    const total_donor = `(${GetDonationProjectDonationQuery(
      'data',
      'COUNT(DISTINCT "donation"."userId")',
    )})`

    if (query.total_donors?.start) {
      results.condition.andWhere(`${total_donor} >= :donorStart`, {
        donorStart: query.total_donors?.start,
      })
    }

    if (query.total_donors?.end) {
      results.condition.andWhere(`${total_donor} <= :donorEnd`, {
        donorEnd: query.total_donors?.end,
      })
    }

    if (query.total_donations?.start) {
      results.condition.andWhere(`${total_donation} >= :donationStart`, {
        donationStart: query.total_donations?.start,
      })
    }

    if (query.total_donations?.end) {
      results.condition.andWhere(`${total_donation} <= :donationEnd`, {
        donationEnd: query.total_donations?.end,
      })
    }

    if (isExport) {
      const data = await results.condition.getMany()

      if (!data.length) {
        throw new NotFoundException(ErrorKey.NO_DATA_TO_EXPORT)
      }

      const csvData: ICsvNonprofitDonationProject[] = data.map(this.toCSVDonationProject)

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.customPaginate(results)
  } catch (error) {
    throw new BadRequestException(error.message ?? error.toString())
  }
}
