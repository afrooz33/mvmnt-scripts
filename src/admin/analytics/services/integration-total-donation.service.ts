import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'
import { DonationType } from '@app/src/donations/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'

const queryBuilder = (query: DateFilterQueryDto, reason: DonationType): string => {
  let day_groupby = ''
  let day_groupby_select = ''
  let day_select = ''
  let order_by = ''
  let left_join = ''

  const { start, end } = GetDateFilterRange(query?.date_filter?.start, query?.date_filter?.end)
  const daysDifference = GetDaysDifference(start, end)

  if (daysDifference <= 120) {
    day_groupby = ', EXTRACT(DAY FROM "d"."created")'
    day_groupby_select = 'EXTRACT(DAY FROM "d"."created") AS day,'
    day_select = 'EXTRACT(DAY FROM ds.dates) AS day,'
    order_by = ', day'
    left_join = 'AND EXTRACT(DAY FROM "ds"."dates") = gd.day'
  }

  return `WITH date_series AS (
      SELECT generate_series(
        '${start}'::DATE,
        '${end}'::DATE,
        CASE 
          WHEN ('${end}'::date - '${start}'::date) <= 120 THEN '1 day'::interval
          ELSE '1 month'::interval
        END
      )::DATE AS dates
    ),
    grouped_donations AS (
      SELECT
        EXTRACT(YEAR FROM "d"."created") AS year,
        EXTRACT(MONTH FROM "d"."created") AS month,
        ${day_groupby_select}
        COALESCE(SUM("d"."amount"), 0) AS total_donation
      FROM
        "user_donations" "d"
      LEFT JOIN
        "user_donation_payment" "p" ON "p"."id" = "d"."userDonationPaymentId"
      LEFT JOIN
        "re2_integrations" "i" ON "p"."reference_id" = "i"."id"
      WHERE
        "d"."reason" = '${reason}'
        AND DATE_TRUNC('day', "d"."created") BETWEEN '${start}' AND '${end}'
      GROUP BY
        EXTRACT(YEAR FROM "d"."created"),
        EXTRACT(MONTH FROM "d"."created"),
        "d"."reason"
        ${day_groupby}
    )
    SELECT
      EXTRACT(YEAR FROM ds.dates) AS year,
      EXTRACT(MONTH FROM ds.dates) AS month,
      ${day_select}
      COALESCE(gd.total_donation, 0) AS total_donation
    FROM
      date_series ds
    LEFT JOIN
      grouped_donations gd
    ON
      EXTRACT(YEAR FROM ds.dates) = gd.year
      AND EXTRACT(MONTH FROM ds.dates) = gd.month
      ${left_join}
    ORDER BY
      year, month${order_by};`
}

export default async function (query: DateFilterQueryDto, isExport = false) {
  try {
    const cart_banner_data = await this.entityManager.query(
      queryBuilder(query, DonationType.INTEGRATION_CART_BANNER),
    )
    const cart_drawer_data = await this.entityManager.query(
      queryBuilder(query, DonationType.INTEGRATION_CART_DRAWER),
    )
    const sales_portion_data = await this.entityManager.query(
      queryBuilder(query, DonationType.INTEGRATION_SALES_PORTION),
    )

    if (isExport) {
      const csvData: any[] = []

      cart_banner_data.forEach((item) => {
        csvData.push({
          Reason: 'Cart Banner',
          Year: item.year,
          Month: item.month,
          Day: item.day,
          'Total Donation': item.total_donation,
        })
      })

      cart_drawer_data.forEach((item) => {
        csvData.push({
          Reason: 'Cart Drawer',
          Year: item.year,
          Month: item.month,
          Day: item.day,
          'Total Donation': item.total_donation,
        })
      })

      sales_portion_data.forEach((item) => {
        csvData.push({
          Reason: 'Sales Portion',
          Year: item.year,
          Month: item.month,
          Day: item.day,
          'Total Donation': item.total_donation,
        })
      })

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return {
      cart_banner_data,
      cart_drawer_data,
      sales_portion_data,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
