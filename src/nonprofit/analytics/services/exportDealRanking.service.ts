import { ExportToCsv } from 'export-to-csv'
import {
  GetDealFirstImageQuery,
  GetTotalDealSalesQuery,
  CheckNonprofitDonationQuery,
  GenerateDateRangeFilter,
} from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { ICsvNonprofitDealRanking, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'

export default async function (
  query: DateFilterQueryDto,
  userId: string,
): Promise<ICsvNonprofitDealRanking> {
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

    const deal_image = `(SELECT
        "images"."url"
      FROM
        "images"
      LEFT JOIN
        "deals_images_images" "deal_images" ON "deal_images"."imagesId" = "images"."id"
      WHERE "deal"."id" = "deal_images"."dealsId" LIMIT 1)`

    const total_donation = `(SELECT
        COALESCE(SUM("donation"."amount"), 0)
      FROM
        "user_donations" "donation"
      INNER JOIN "user_deal_item_payment" "payment" ON "payment"."id" = "donation"."userDealItemPaymentId"
      WHERE "payment"."dealId" = "deal"."id"
        AND "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')${query_condition})`

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.deal')
      .addRelation('deal.user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.andWhere(`"user_deal_item_payment"."dealId" IS NOT NULL`)

    results.condition.andWhere(CheckNonprofitDonationQuery('data', userId))

    results.condition.select([
      `RANK() OVER (ORDER BY ${total_donation} DESC) AS "rank"`,
      'user.username',
      'user.account_type',
      'user.display_name',
      'profile.social_accounts',
      'profile_images.url as "profile_image"',
      'deal.id',
      'deal.name',
      'deal.start_date',
      'deal.end_date',
      'deal.status',
      `${deal_image} AS "deal_image"`,
      'deal.deal_type',
      `${total_donation} AS "total_donation"`,
      `${GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')}`,
      `(${GetTotalDealSalesQuery({
        dealId: '"deal"."id"',
      })}) AS "total_sales"`,
    ])

    results.condition.addGroupBy([
      `"deal"."id"`,
      `"user"."id"`,
      `"profile"."id"`,
      `"profile_images"."id"`,
    ])

    results.condition.orderBy({
      total_donation: 'DESC',
    })

    const data: [] = await results.condition.getRawMany()

    const csvData: ICsvNonprofitDealRanking[] = data.map(this.toCsvNonprofitDealRanking)

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
