import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { TopStatQueryDto } from '@app/src/admin/payments/dto'
import { ICsvAdminMarginGraphData } from '@app/src/shared/interfaces'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'

const queryBuilder = (query: TopStatQueryDto): string => {
  let day_groupby = ''
  let day_groupby_select = ''
  let day_select = ''
  let order_by = ''
  let left_join = ''

  const { start, end } = GetDateFilterRange(query?.donation_date?.start, query?.donation_date?.end)

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
    )::DATE AS dates),
    grouped_donations AS (
      SELECT
        EXTRACT(YEAR FROM "t"."created") AS year,
        EXTRACT(MONTH FROM "t"."created") AS month,
        ${day_groupby_select}
        COALESCE(SUM("t"."amount") - SUM("t"."net_amount"), 0) AS total_amount
      FROM
        "user_donations" "t"
      WHERE
        "t"."created" BETWEEN '${start}' AND '${end}'
        AND "t"."status" = '${DONATION_STATUS.COMPLETED}'
        AND "t"."system_fees" > 0
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

export default async function (query: TopStatQueryDto, isExport = false) {
  try {
    if (isExport) {
      const data: [] = await this.entityManager.query(queryBuilder(query))

      const csvData: ICsvAdminMarginGraphData[] = data.map((item: any) => {
        return {
          Year: item.year,
          Month: item.month,
          Day: item.day ? item.day : '',
          'Total amount': item.total_amount,
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
