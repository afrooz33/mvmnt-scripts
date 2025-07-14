import { ExportToCsv } from 'export-to-csv'
import { GenerateDateRangeFilter } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'
import { DonationType } from '@app/src/donations/enums'

export default async function (
  deal_type: any,
  query: DateFilterQueryDto,
  type: string,
  isExport = false,
) {
  try {
    const query_condition_deals = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'deal',
      condition: ' AND ',
    })

    const query_condition_payments = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'deal_payment',
      condition: ' AND ',
    })

    let sql = ''

    if (type === 'price') {
      let deal_type_condition = `AND "deal_payment"."deal_type" = '${deal_type}'`

      if (deal_type === 'all') {
        deal_type_condition = `AND "deal_payment"."deal_type" IN (
          '${DonationType.AUCTION}',
          '${DonationType.RAFFLE}',
          '${DonationType.BUYNOW}'
        )`
      }

      sql = `SELECT
        "category"."name" AS "category",
        ${deal_type === 'all' ? '' : '"deal"."deal_type" AS "deal_type",'}
        COALESCE(SUM("donation"."amount"), 0)::float AS "total_donation",
        COALESCE(SUM("deal_payment"."deal_amount"), 0)::float AS "total_sales"
      FROM
        "user_donations" "donation"
      INNER JOIN "user_deal_item_payment" "payment" ON "donation"."userDealItemPaymentId" = "payment"."id"
      INNER JOIN "user_deal_payment" "deal_payment" ON "payment"."paymentId" = "deal_payment"."id"
      INNER JOIN "deals" "deal" ON "payment"."dealId" = "deal"."id"
      INNER JOIN "deal_categories" "category" ON "deal"."categoryId" = "category"."id"
      WHERE
        "payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')
        ${deal_type_condition}
        ${query_condition_payments}
      GROUP BY "category"."id" ${deal_type === 'all' ? '' : ', "deal"."deal_type"'}
      ORDER BY "total_donation" DESC`
    } else if (type === 'user') {
      sql = `
        SELECT
          "category"."name" AS "category",
          "deal"."deal_type" AS "deal_type",
          COALESCE(COUNT(DISTINCT "deal"."userId"), 0) AS "total_creators",
          (
            SELECT
              COALESCE(SUM("donation"."amount"), 0)::float
            FROM
              "user_donations" "donation"
            INNER JOIN "user_deal_item_payment" "payment" ON "donation"."userDealItemPaymentId" = "payment"."id"
            INNER JOIN "user_deal_payment" "deal_payment" ON "payment"."paymentId" = "deal_payment"."id"
            INNER JOIN "deals" "deal" ON "payment"."dealId" = "deal"."id"
            WHERE
              "deal"."categoryId" = "category"."id"
              AND "deal"."deal_type" = '${deal_type}'
              AND "deal_payment"."status" IN ('${PAYMENT_STATUS.COMPLETED}', '${PAYMENT_STATUS.DONATION_SETTLED}')
              ${query_condition_deals}
              GROUP BY "deal"."categoryId", "deal"."deal_type"
          ) AS "total_donation"
        FROM
          "deal_categories" "category"
        LEFT JOIN "deals" "deal" ON "category"."id" = "deal"."categoryId"
        WHERE
          "deal"."deal_type" = '${deal_type}'
          ${query_condition_deals}
        GROUP BY "category"."id", "deal"."deal_type"
        HAVING COUNT(DISTINCT "deal"."userId") > 0
        ORDER BY "total_creators" DESC
      `
    }

    const result = await this.entityManager.query(sql)

    if (isExport) {
      const csvData = result.map((item: any) => {
        if (type === 'price') {
          return {
            Category: item.category,
            'Deal Type': item.deal_type,
            'Total Donation': item.total_donation,
            'Total Sales': item.total_sales,
            'Total Creators': item.total_creators,
            'Total Participants': item.total_participants,
          }
        } else if (type === 'user') {
          return {
            Category: item.category,
            'Deal Type': item.deal_type,
            'Total Creators': item.total_creators,
            'Total Participants': item.total_participants,
          }
        }
      })

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return result
  } catch (error) {
    return HandleErrors(error)
  }
}
