import { ExportToCsv } from 'export-to-csv'
import { QueryDto } from '@app/src/admin/deals/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ICsvDeals, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { GetGrossDonationsQuery, GetTotalDealSalesQuery } from '@app/src/shared/sql'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export default async function (query: QueryDto, isExport = false): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealRepository)
      .create()

    results.condition.select([
      'user',
      'profile',
      'images',
      'data.id',
      'data.name',
      'data.brand',
      'data.status',
      'data.created',
      'data.end_date',
      'data.currency',
      'data.deal_type',
      'data.start_date',
      'data.total_bids',
      'data.description',
      'donation_project',
      'data.total_sales',
      'data.current_bid',
      'donation_nonprofit',
      'data.net_donation',
      'data.donation_type',
      'data.participants',
      'data.total_donation',
    ])

    if (query?.gross_donation?.start) {
      results.condition.andWhere(`(${GetGrossDonationsQuery('"data"')}) >= :total_donation`, {
        total_donation: query.gross_donation.start,
      })
    }

    if (query?.gross_donation?.end) {
      results.condition.andWhere(`(${GetGrossDonationsQuery('"data"')}) <= :total_donation`, {
        total_donation: query.gross_donation.end,
      })
    }

    if (query?.total_sales?.start) {
      results.condition.andWhere(
        `(${GetTotalDealSalesQuery({
          dealId: '"data"."id"',
        })}) >= :total_sales`,
        {
          total_sales: query.total_sales.start,
        },
      )
    }

    if (query?.total_sales?.end) {
      results.condition.andWhere(
        `(${GetTotalDealSalesQuery({
          dealId: '"data"."id"',
        })}) <= :total_sales`,
        {
          total_sales: query.total_sales.end,
        },
      )
    }

    if (query?.buynow_participants?.start) {
      results.condition.andWhere(
        `(${GetTotalDealSalesQuery({
          dealId: '"data"."id"',
          dealType: DealType.BUYNOW,
          select: 'COALESCE(COUNT(DISTINCT "payment"."userId")::int, 0)',
        })}) >= :buynow_participants`,
        {
          buynow_participants: query.buynow_participants.start,
        },
      )
    }

    if (query?.buynow_participants?.end) {
      results.condition.andWhere(
        `(${GetTotalDealSalesQuery({
          dealId: '"data"."id"',
          dealType: DealType.BUYNOW,
          select: 'COALESCE(COUNT(DISTINCT "payment"."userId")::int, 0)',
        })}) <= :buynow_participants`,
        {
          buynow_participants: query.buynow_participants.end,
        },
      )
    }

    if (!query?.filter?.status) {
      results.condition.andWhere(`"data"."status" NOT IN (:...deal_status)`, {
        deal_status: [DealStatus.DELETED, DealStatus.DRAFT],
      })
    }

    if (query?.keyword) {
      const keyword = `%${query.keyword}%`

      results.condition.andWhere(
        `("data"."name" ILIKE :keyword
        OR "data"."description" ILIKE :keyword
        OR "user"."username" ILIKE :keyword
        OR "donation_project"."name" ILIKE :keyword
        OR "donation_nonprofit"."id" IN (
          SELECT "userId"
          FROM "nonprofit_profiles"
          WHERE "first_name" ILIKE :keyword
          OR "last_name" ILIKE :keyword
          OR "foundation_name" ILIKE :keyword
        ))`,
        { keyword },
      )
    }

    if (isExport) {
      const data = await results.condition.getMany()

      const csvData: ICsvDeals[] = data.map(this.toCSV)

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
