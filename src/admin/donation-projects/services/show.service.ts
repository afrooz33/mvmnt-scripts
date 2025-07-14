import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ICsvDonationProject, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { GetDonationProjectDonationQuery, GetNetOrGrossDonationField } from '@app/src/shared/sql'
import { QueryDto } from '@app/src/admin/donation-projects/dto'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

export default async function (query: QueryDto, isExport = false): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationProjectRepository)
      .create()

    if (query?.filter?.status) {
      results.condition.andWhere('"data"."status" NOT IN (:...donation_project_status)', {
        donation_project_status: [DonationProjectStatus.DELETED, DonationProjectStatus.DEFAULT],
      })
    }

    if (query?.gross_donations?.start) {
      results.condition.andWhere(
        `(${GetDonationProjectDonationQuery(
          'data',
          `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        )}) >= :gross_donation_start`,
        {
          gross_donation_start: query.gross_donations.start,
        },
      )
    }

    if (query?.gross_donations?.end) {
      results.condition.andWhere(
        `(${GetDonationProjectDonationQuery(
          'data',
          `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        )}) <= :gross_donation_end`,
        {
          gross_donation_end: query.gross_donations.end,
        },
      )
    }

    if (query?.total_donors?.start) {
      results.condition.andWhere(
        `(${GetDonationProjectDonationQuery(
          'data',
          'COUNT(DISTINCT "donation"."userId")',
        )}) >= :total_donors_start`,
        {
          total_donors_start: query.total_donors.start,
        },
      )
    }

    if (query?.total_donors?.end) {
      results.condition.andWhere(
        `(${GetDonationProjectDonationQuery(
          'data',
          'COUNT(DISTINCT "donation"."userId")',
        )}) <= :total_donors_end`,
        {
          total_donors_end: query.total_donors.end,
        },
      )
    }

    if (isExport) {
      const data: DonationProjectEntity[] = await results.condition.getMany()

      const csvData: ICsvDonationProject[] = data.map(this.toCSV)

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
