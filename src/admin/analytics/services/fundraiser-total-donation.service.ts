import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'

const queryBuilder = (query: DateFilterQueryDto, type: FundraiserType): string => {
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
        "re2_fundraisers" "r" ON "p"."reference_id" = "r"."id"
      WHERE
        DATE_TRUNC('day', "d"."created") BETWEEN '${start}' AND '${end}'
        AND "r"."type" = '${type}'
      GROUP BY
        EXTRACT(YEAR FROM "d"."created"),
        EXTRACT(MONTH FROM "d"."created")
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

export default async function (query: DateFilterQueryDto, type: FundraiserType, isExport = false) {
  try {
    const data: any[] = await this.entityManager.query(queryBuilder(query, type))

    if (isExport) {
      const csvData = data.map((item: any) => ({
        Year: item.year,
        Month: item.month,
        Day: item.day ? item.day : '',
        'Total Donation': item.total_donation,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return data
  } catch (error) {
    return HandleErrors(error)
  }
}
