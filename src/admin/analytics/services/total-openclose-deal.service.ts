import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GenerateGroupedParticipantQuery } from '@app/src/shared/sql'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'

const GetTotalOpenCloseDealQuery = (deal_type: DealType, query: DateFilterQueryDto): string => {
  let day_groupby = ''
  let day_select = ''
  let order_by = ''
  let left_join = ''

  const { start, end } = GetDateFilterRange(query?.date_filter?.start, query?.date_filter?.end)

  const daysDifference = GetDaysDifference(start, end)

  if (daysDifference <= 120) {
    day_groupby = 'DAY'
    day_select = 'EXTRACT(DAY FROM ds.dates) AS day,'
    order_by = ', day'
    left_join = 'AND EXTRACT(DAY FROM "ds"."dates") = gtp.day'
  }

  const groupedQuery = GenerateGroupedParticipantQuery({
    name: 'grouped_total_deal',
    table: 'deals',
    alias: 'd',
    dealType: deal_type,
    dateColumn: 'start_date',
    dateRange: { start, end },
    filters: [],
    selectFields: [
      `COUNT(*) FILTER (WHERE "d"."status" = '${DealStatus.ON_DEAL}') AS total_open_deal`,
      `COUNT(*) FILTER (WHERE "d"."status" = '${DealStatus.ENDED}') AS total_close_deal`,
    ],
    groupBy: ['YEAR', 'MONTH', ...(day_groupby ? [day_groupby] : [])],
  })

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
    ${groupedQuery}
    SELECT
      EXTRACT(YEAR FROM ds.dates) AS year,
      EXTRACT(MONTH FROM ds.dates) AS month,
      ${day_select}
      COALESCE(gtp.total_open_deal, 0) AS total_open_deal,
      COALESCE(gtp.total_close_deal, 0) AS total_close_deal
    FROM
      date_series ds
    LEFT JOIN
      grouped_total_deal gtp
    ON
      EXTRACT(YEAR FROM ds.dates) = gtp.year
      AND EXTRACT(MONTH FROM ds.dates) = gtp.month
      ${left_join}
    ORDER BY
      year, month${order_by};`
}

export default async function (
  deal_type: DealType,
  query: DateFilterQueryDto,
  isExport = false,
): Promise<any> {
  try {
    if (isExport) {
      const data: [] = await this.entityManager.query(GetTotalOpenCloseDealQuery(deal_type, query))

      const csvData = data.map((item: any) => {
        return {
          Year: item.year,
          Month: item.month,
          Day: item.day ? item.day : '',
          'Total open deal': item.total_open_deal,
          'Total close deal': item.total_close_deal,
        }
      })

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.entityManager.query(GetTotalOpenCloseDealQuery(deal_type, query))
  } catch (error) {
    return HandleErrors(error)
  }
}
