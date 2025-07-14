import { ExportToCsv } from 'export-to-csv'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

const queryBuilder = (query: DateFilterQueryDto): string => {
  let day_groupby = ''
  let day_groupby_select = ''
  let day_select = ''
  let order_by = ''
  let left_join = ''

  const { start, end } = GetDateFilterRange(query?.date_filter?.start, query?.date_filter?.end)

  const daysDifference = GetDaysDifference(start, end)

  if (daysDifference <= 120) {
    day_groupby = ', EXTRACT(DAY FROM "t"."created")'
    day_groupby_select = 'EXTRACT(DAY FROM "t"."created") AS day,'
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
        EXTRACT(YEAR FROM "t"."created") AS year,
        EXTRACT(MONTH FROM "t"."created") AS month,
        ${day_groupby_select}
        COUNT(*) FILTER(WHERE "t"."account_type" = 'INDIVIDUAL_PERSONAL') AS total_personal,
        COUNT(*) FILTER(WHERE "t"."account_type" = 'INDIVIDUAL_INFLUENCER') AS total_influencer,
        COUNT(*) FILTER(WHERE "t"."account_type" IN ('BUSINESS_SOLE_PROPRIETOR', 'BUSINESS_COMPANY')) AS total_business
      FROM
        "users" "t"
      WHERE
        "t"."created" BETWEEN '${start}' AND '${end}'
        AND "t"."account_type" IN ('INDIVIDUAL_PERSONAL', 'INDIVIDUAL_INFLUENCER', 'BUSINESS_SOLE_PROPRIETOR', 'BUSINESS_COMPANY')
      GROUP BY
        EXTRACT(YEAR FROM "t"."created"),
        EXTRACT(MONTH FROM "t"."created")
        ${day_groupby}
    )
    SELECT
      EXTRACT(YEAR FROM ds.dates) AS year,
      EXTRACT(MONTH FROM ds.dates) AS month,
      ${day_select}
      COALESCE(gd.total_personal, 0) AS total_personal,
      COALESCE(gd.total_influencer, 0) AS total_influencer,
      COALESCE(gd.total_business, 0) AS total_business
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
    if (isExport) {
      const data: [] = await this.entityManager.query(queryBuilder(query))

      const csvData = data.map((item: any) => {
        return {
          Year: item.year,
          Month: item.month,
          Day: item.day ? item.day : '',
          'Total personal': item.total_personal,
          'Total influencer': item.total_influencer,
          'Total business': item.total_business,
        }
      })

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.entityManager.query(queryBuilder(query))
  } catch (error) {
    return HandleErrors(error)
  }
}
