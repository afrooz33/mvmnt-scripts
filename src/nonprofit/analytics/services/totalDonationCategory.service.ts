import { CheckNonprofitDonationQuery, GenerateDateRangeFilter } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'

export default async function (query: DateFilterQueryDto, userId: string) {
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

    const sql = `SELECT
        "category"."name" AS "category",
        "deal"."deal_type" AS "deal_type",
        COALESCE(SUM("donation"."amount"), 0)::float AS "total_donation"
      FROM
        "user_donations" "donation"
      INNER JOIN "user_deal_item_payment" "payment" ON "donation"."userDealItemPaymentId" = "payment"."id"
      INNER JOIN "deals" "deal" ON "payment"."dealId" = "deal"."id"
      INNER JOIN "deal_categories" "category" ON "deal"."categoryId" = "category"."id"
      WHERE
        "donation"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        AND ${CheckNonprofitDonationQuery('donation', userId)}
        ${query_condition}
      GROUP BY "category"."id", "deal"."deal_type"
      ORDER BY "total_donation" DESC`

    const result = await this.entityManager.query(sql)

    return result
  } catch (error) {
    return HandleErrors(error)
  }
}
