import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

const queryBuilder = (query: DateFilterQueryDto): string => {
  let day_groupby = ''
  let day_groupby_select = ''
  let day_select = ''
  let order_by = ''
  let left_join = ''

  const { start, end } = GetDateFilterRange(query?.date_filter?.start, query?.date_filter?.end)

  const daysDifference = GetDaysDifference(start, end)

  if (daysDifference <= 120) {
    day_groupby = ', EXTRACT(DAY FROM "r"."created")'
    day_groupby_select = 'EXTRACT(DAY FROM "r"."created") AS day,'
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
    grouped_integration_shopify AS (
      SELECT
        EXTRACT(YEAR FROM "r"."created") AS year,
        EXTRACT(MONTH FROM "r"."created") AS month,
        ${day_groupby_select}
        COUNT("r"."id") FILTER(WHERE "r"."status" = '${IntegrationStatus.ENABLED}') AS opened,
        COUNT("r"."id") FILTER(WHERE "r"."status" = '${IntegrationStatus.DISABLED}') AS ended
      FROM
        "re2_integrations" "r"
      WHERE
        DATE_TRUNC('day', "r"."created") BETWEEN '${start}' AND '${end}'
      GROUP BY
        EXTRACT(YEAR FROM "r"."created"),
        EXTRACT(MONTH FROM "r"."created")
        ${day_groupby}
    )
    SELECT
      EXTRACT(YEAR FROM ds.dates) AS year,
      EXTRACT(MONTH FROM ds.dates) AS month,
      ${day_select}
      COALESCE(gd.opened, 0) AS opened,
      COALESCE(gd.ended, 0) AS ended
    FROM
      date_series ds
    LEFT JOIN
      grouped_integration_shopify gd
    ON
      EXTRACT(YEAR FROM ds.dates) = gd.year
      AND EXTRACT(MONTH FROM ds.dates) = gd.month
      ${left_join}
    ORDER BY
      year, month${order_by};`
}

export default async function (query: DateFilterQueryDto, isExport = false) {
  try {
    const data: any[] = await this.entityManager.query(queryBuilder(query))

    if (isExport) {
      const csvData = data.map((item: any) => ({
        Year: item.year,
        Month: item.month,
        Day: item.day ? item.day : '',
        'Total Opened': item.opened,
        'Total Ended': item.ended,
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
