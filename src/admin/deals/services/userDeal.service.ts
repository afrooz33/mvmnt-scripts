import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/admin/deals/dto'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import {
  GetDealImageQuery,
  GetDealQuantityQuery,
  GetDealDonationQuery,
  GetTotalDealSalesQuery,
  GetDealSalePurchaseQuery,
  GetNetOrGrossDonationField,
} from '@app/src/shared/sql'

export default async function (userId: string, query: QueryDto): Promise<PaginateRO> {
  try {
    const gross_donations = GetDealDonationQuery({
      select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)`,
      userId: userId,
      dealId: '"data"."id"',
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealRepository)
      .addFilter('user', userId)
      .addRelation('donation_nonprofit')
      .addRelation('donation_nonprofit.profile')
      .addRelation('donation_project')
      .create()

    results.condition.select([
      'data.id',
      'data.name',
      'data.status',
      'data.currency',
      'data.end_date',
      'data.deal_type',
      'data.start_date',
      'data.description',
      'data.donation_type',
      `${GetDealImageQuery(`"data"."id"`)} AS "deal_image"`,
      `(${gross_donations}) as gross_donations`,
      `(${GetDealDonationQuery({
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)`,
        dealId: '"data"."id"',
      })}) AS "total_donation"`,
      `"donation_project"."name" AS "donation_project_name"`,
      `"profile"."first_name"`,
      `"profile"."last_name"`,
      `(SELECT MAX("bids"."bid_amount") FROM "user_deal_bids" "bids" WHERE "bids"."dealId" = "data"."id") AS "current_bid"`,
      `(${GetTotalDealSalesQuery({
        dealId: '"data"."id"',
        dealType: DealType.RAFFLE,
      })}) AS "total_raffle_sales"`,
      `(${GetTotalDealSalesQuery({
        dealId: '"data"."id"',
        select: 'COALESCE(COUNT(DISTINCT "payment"."userId"), 0)',
      })}) AS "participants"`,
      `(${GetDealSalePurchaseQuery({
        dealId: '"data"."id"',
        dealType: DealType.BUYNOW,
      })}) AS "total_buynow_sales"`,
      `${GetDealQuantityQuery('"data"."id" = "deals"."id"')} AS "remaining_quantity"`,
      `(${GetTotalDealSalesQuery({
        dealId: '"data"."id"',
        dealType: DealType.BUYNOW,
        select: 'COALESCE(COUNT(DISTINCT "payment"."userId")::int, 0)',
      })}) AS "buynow_participants"`,
      `(${GetTotalDealSalesQuery({
        dealId: '"data"."id"',
      })}) as "total_sales"`,
    ])

    results.condition.andWhere(`"data"."status" NOT IN (:...deal_status)`, {
      deal_status: [DealStatus.DRAFT, DealStatus.DELETED, DealStatus.DELETE_REQUESTED],
    })

    results.condition.orderBy(`(${gross_donations})`, 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
