import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ICsvDonationProjectRanking, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import {
  CheckNonprofitDonationQuery,
  GetDonationProjectImageQuery,
  GetUserDonationProjectDonationQuery,
} from '@app/src/shared/sql'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (
  query: DateFilterQueryDto,
  userId: string,
  csvExport = false,
): Promise<PaginateRO | ICsvDonationProjectRanking> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('donation_project')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.andWhere(CheckNonprofitDonationQuery('data', userId))

    results.condition.select([
      `RANK() OVER (ORDER BY (${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })}) DESC) AS "rank"`,
      'donation_project.id as id',
      'donation_project.name',
      `${GetDonationProjectImageQuery(
        `"donation_project"."id" = "donation_project_images"."donationProjectsId"`,
      )} AS "donation_project_image"`,
    ])

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_donation',
    )
    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        isDirect: true,
        reason: [DonationType.DIRECT_DONATION],
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_direct_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
        reason: [DonationType.BUYNOW, DonationType.AUCTION, DonationType.RAFFLE],
      })})`,
      'total_deal_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT("donation"."id"), 0)::int',
        isDirect: true,
        reason: [DonationType.DIRECT_DONATION],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_direct_donation_count',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT("donation"."id"), 0)::int',
        reason: [DonationType.BUYNOW, DonationType.AUCTION, DonationType.RAFFLE],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_deal_donation_count',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT("donation"."id"), 0)::int',
        reason: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_re2_donation_count',
    )
    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        reason: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_re2_donation',
    )

    results.condition.groupBy(`"donation_project"."id"`)

    results.condition.orderBy(`"total_donation"`, 'DESC')

    if (csvExport) {
      const data: [] = await results.condition.getRawMany()

      const csvData: ICsvDonationProjectRanking[] = data.map(this.toCsvDonationProjectRanking)

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
