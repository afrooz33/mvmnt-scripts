import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetDateFilterRange, GetDaysDifference } from '@app/src/shared/helpers/Date.helper'
import { DonationType } from '@app/src/donations/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { MvmntDonationQueryDto } from '@app/src/admin/analytics/dto'

const GetTotalDonationsQuery = (query: MvmntDonationQueryDto, reason: DonationType): string => {
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

  const groupedQuery = `
    grouped_total_donations AS (
      SELECT
        EXTRACT(YEAR FROM udp.created) AS year,
        EXTRACT(MONTH FROM udp.created) AS month,
        ${day_groupby ? `EXTRACT(${day_groupby} FROM udp.created) AS day,` : ''}
        SUM(ud.amount - ud.system_fees) AS gross_donation
      FROM
        user_deal_payment udp
      JOIN
        user_deal_item_payment udip ON udip."paymentId" = udp.id
      LEFT JOIN
        user_donations ud ON ud."userDealItemPaymentId" = udip.id
      WHERE
        ud.reason = '${reason}'
        AND udp.created BETWEEN '${start}' AND '${end}'
        AND udip.status IN ('${PAYMENT_STATUS.DONATION_SETTLED}', '${PAYMENT_STATUS.COMPLETED}')
      GROUP BY
        EXTRACT(YEAR FROM udp.created),
        EXTRACT(MONTH FROM udp.created)
        ${day_groupby ? `, EXTRACT(${day_groupby} FROM udp.created)` : ''}
    )
  `

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
      COALESCE(gtd.gross_donation, 0) AS gross_donation
    FROM
      date_series ds
    LEFT JOIN
      grouped_total_donations gtd
    ON
      EXTRACT(YEAR FROM ds.dates) = gtd.year
      AND EXTRACT(MONTH FROM ds.dates) = gtd.month
      ${left_join}
    ORDER BY
      year, month${order_by};`
}

export default async function (query: MvmntDonationQueryDto, isExport = false): Promise<any> {
  try {
    const reasons = [
      DonationType.AUCTION,
      DonationType.RAFFLE,
      DonationType.BUYNOW,
      DonationType.DIRECT_DONATION,
    ]

    const data = await Promise.all(
      reasons.map(async (reason) => {
        const result = await this.entityManager.query(GetTotalDonationsQuery(query, reason))
        return { [reason]: result }
      }),
    )

    const groupedData: Record<string, any[]> = data.reduce((acc, item) => {
      const [key, value] = Object.entries(item)[0]
      acc[key] = value
      return acc
    }, {})

    if (isExport) {
      const csvData = reasons.flatMap((reason) => {
        return groupedData[reason].map((item) => ({
          'Donation Type': reason,
          Year: item.year,
          Month: item.month,
          Day: item.day ? item.day : '',
          'Gross Donation': item.gross_donation,
        }))
      })

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return groupedData
  } catch (error) {
    return HandleErrors(error)
  }
}
