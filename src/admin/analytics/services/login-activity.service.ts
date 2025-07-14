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
    day_groupby = ', EXTRACT(DAY FROM "l"."login_time")'
    day_groupby_select = 'EXTRACT(DAY FROM "l"."login_time") AS day,'
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
        EXTRACT(YEAR FROM "l"."login_time") AS year,
        EXTRACT(MONTH FROM "l"."login_time") AS month,
        ${day_groupby_select}
        COUNT("l"."id") FILTER(WHERE "t"."account_type" = 'INDIVIDUAL_PERSONAL') AS personal_login,
        COUNT("l"."id") FILTER(WHERE "t"."account_type" = 'INDIVIDUAL_INFLUENCER') AS influencer_login,
        COUNT("l"."id") FILTER(WHERE "t"."account_type" IN ('BUSINESS_SOLE_PROPRIETOR', 'BUSINESS_COMPANY')) AS business_login
      FROM
        "login_activity" "l"
      LEFT JOIN
        "users" "t" ON "t"."id" = "l"."userId"
      WHERE
        DATE_TRUNC('day', "l"."login_time") BETWEEN '${start}' AND '${end}'
        AND "t"."account_type" IN ('INDIVIDUAL_PERSONAL', 'INDIVIDUAL_INFLUENCER', 'BUSINESS_SOLE_PROPRIETOR', 'BUSINESS_COMPANY')
      GROUP BY
        EXTRACT(YEAR FROM "l"."login_time"),
        EXTRACT(MONTH FROM "l"."login_time")
        ${day_groupby}
    )
    SELECT
      EXTRACT(YEAR FROM ds.dates) AS year,
      EXTRACT(MONTH FROM ds.dates) AS month,
      ${day_select}
      COALESCE(gd.personal_login, 0) AS personal_login,
      COALESCE(gd.influencer_login, 0) AS influencer_login,
      COALESCE(gd.business_login, 0) AS business_login
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
          'Total personal': item.personal_login,
          'Total influencer': item.influencer_login,
          'Total business': item.business_login,
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
