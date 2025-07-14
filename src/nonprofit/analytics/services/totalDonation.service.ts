import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'
import { DONATION_REASON, DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'

const queryBuilder = (
  query: DateFilterQueryDto,
  userId: string,
  isDirect = false,
  donation_source: DealType | null = null,
  isRE2 = false,
): string => {
  let order_by = ''
  let left_join = ''
  let day_select = ''
  let day_groupby = ''
  let day_groupby_select = ''
  let donation_condition = ` AND "t"."reason" = '${DONATION_REASON.DEAL}'`
  const payment_join = ` LEFT JOIN "user_deal_item_payment" "payment" ON "t"."userDealItemPaymentId" = "payment"."id"`

  const { start, end } = GetDateFilterRange(query?.date_filter?.start, query?.date_filter?.end)

  const daysDifference = GetDaysDifference(start, end)

  if (daysDifference <= 120) {
    day_groupby = ', EXTRACT(DAY FROM "t"."created")'
    day_groupby_select = 'EXTRACT(DAY FROM "t"."created") AS day,'
    day_select = 'EXTRACT(DAY FROM ds.dates) AS day,'
    order_by = ', day'
    left_join = 'AND EXTRACT(DAY FROM "ds"."dates") = gd.day'
  }

  if (isDirect) {
    donation_condition = ` AND "t"."reason" = '${DonationType.DIRECT_DONATION}'`
  }

  if (isRE2) {
    donation_condition = ` AND "t"."reason" IN (
      '${DonationType.FUNDRAISER_FORM}',
      '${DonationType.FUNDRAISER_PAGE}',
      '${DonationType.INTEGRATION_CART_BANNER}',
      '${DonationType.INTEGRATION_CART_DRAWER}',
      '${DonationType.INTEGRATION_SALES_PORTION}',
    )`
  }

  if (donation_source && !isDirect) {
    donation_condition = ` AND "payment"."dealId" IN (
      SELECT "id"
      FROM "deals"
      WHERE "deal_type" = '${donation_source}' AND "userId" = '${userId}'
    )`
  }

  return `WITH date_series AS (
      SELECT generate_series(
        '${start}'::DATE,
        '${end}'::DATE,
        CASE 
          WHEN ('${end}'::date - '${start}'::date) <= 120 THEN '1 day'::interval
          ELSE '1 month'::interval
        END
    )::DATE AS dates),
    grouped_donations AS (
      SELECT
        EXTRACT(YEAR FROM "t"."created") AS year,
        EXTRACT(MONTH FROM "t"."created") AS month,
        ${day_groupby_select}
        COALESCE(SUM("t"."amount"), 0) AS total_amount
      FROM
        "user_donations" "t"
        ${payment_join}
      WHERE
        "t"."created" BETWEEN '${start}' AND '${end}'
        AND "t"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')
        ${donation_condition}
      AND "t"."donationProjectId" IN (
        SELECT "id"
        FROM "donation_projects"
        WHERE "userId" = '${userId}'
      )
      GROUP BY
        EXTRACT(YEAR FROM "t"."created"),
        EXTRACT(MONTH FROM "t"."created")
        ${day_groupby}
    )
    SELECT
      EXTRACT(YEAR FROM ds.dates) AS year,
      EXTRACT(MONTH FROM ds.dates) AS month,
      ${day_select}
      COALESCE(gd.total_amount, 0) AS total_amount
    FROM
      date_series ds
    LEFT JOIN
      grouped_donations gd
    ON
      EXTRACT(YEAR FROM ds.dates) = gd.year
      AND EXTRACT(MONTH FROM ds.dates) = gd.month
      ${left_join}
    ORDER BY
      year, month${order_by}`
}

export default async function (query: DateFilterQueryDto, userId: string) {
  try {
    const chartData = {
      re2: [],
      raffle: [],
      buynow: [],
      auction: [],
      direct_donation: [],
    }

    chartData.auction = await this.entityManager.query(
      queryBuilder(query, userId, false, DealType.AUCTION),
    )

    chartData.raffle = await this.entityManager.query(
      queryBuilder(query, userId, false, DealType.RAFFLE),
    )

    chartData.buynow = await this.entityManager.query(
      queryBuilder(query, userId, false, DealType.BUYNOW),
    )

    chartData.direct_donation = await this.entityManager.query(queryBuilder(query, userId, true))

    chartData.re2 = await this.entityManager.query(queryBuilder(query, userId, false, null, true))

    return chartData
  } catch (error) {
    return HandleErrors(error)
  }
}
