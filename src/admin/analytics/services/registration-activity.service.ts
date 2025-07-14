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
    day_groupby = ', EXTRACT(DAY FROM "u"."created")'
    day_groupby_select = 'EXTRACT(DAY FROM "u"."created") AS day,'
    day_select = 'EXTRACT(DAY FROM ds.dates) AS day,'
    order_by = ', day'
    left_join = 'AND EXTRACT(DAY FROM "ds"."dates") = gr.day'
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
    grouped_registrations AS (
      SELECT
        EXTRACT(YEAR FROM "u"."created") AS year,
        EXTRACT(MONTH FROM "u"."created") AS month,
        ${day_groupby_select}
        COUNT("u"."id") FILTER(WHERE "u"."account_type" = 'INDIVIDUAL_PERSONAL') AS personal_registration,
        COUNT("u"."id") FILTER(WHERE "u"."account_type" = 'INDIVIDUAL_INFLUENCER') AS influencer_registration,
        COUNT("u"."id") FILTER(WHERE "u"."account_type" IN ('BUSINESS_SOLE_PROPRIETOR', 'BUSINESS_COMPANY')) AS business_registration
      FROM
        "users" "u"
      WHERE
        DATE_TRUNC('day', "u"."created") BETWEEN '${start}' AND '${end}'
        AND "u"."account_type" IN ('INDIVIDUAL_PERSONAL', 'INDIVIDUAL_INFLUENCER', 'BUSINESS_SOLE_PROPRIETOR', 'BUSINESS_COMPANY')
      GROUP BY
        EXTRACT(YEAR FROM "u"."created"),
        EXTRACT(MONTH FROM "u"."created")
        ${day_groupby}
    )
    SELECT
      EXTRACT(YEAR FROM ds.dates) AS year,
      EXTRACT(MONTH FROM ds.dates) AS month,
      ${day_select}
      COALESCE(gr.personal_registration, 0) AS personal_registration,
      COALESCE(gr.influencer_registration, 0) AS influencer_registration,
      COALESCE(gr.business_registration, 0) AS business_registration
    FROM
      date_series ds
    LEFT JOIN
      grouped_registrations gr
    ON
      EXTRACT(YEAR FROM ds.dates) = gr.year
      AND EXTRACT(MONTH FROM ds.dates) = gr.month
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
          'Total personal': item.personal_registration,
          'Total influencer': item.influencer_registration,
          'Total business': item.business_registration,
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
