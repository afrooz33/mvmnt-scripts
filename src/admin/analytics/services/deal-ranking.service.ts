import { ExportToCsv } from 'export-to-csv'
import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GenerateDateRangeFilter, GetNetOrGrossDonationField } from '@app/src/shared/sql'
import { DonationType } from '@app/src/donations/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { DateFilterQueryDto } from '@app/src/admin/analytics/dto'

export default async function (query: DateFilterQueryDto, isExport = false): Promise<PaginateRO> {
  try {
    const donationRangeQuery = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'donation',
      condition: ' AND ',
    })

    const purchaseRangeQuery = GenerateDateRangeFilter({
      query: {
        date_filter: {
          start: query?.date_filter?.start,
          end: query?.date_filter?.end,
        },
      },
      field: 'created',
      alias: 'item_payment',
      condition: ' AND ',
    })

    const results: QueryBuilderDataInterface = await new QueryBuilder(query)
      .useQuery(this.userRepository)
      .addRelation(Query.PROFILE)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere(
      `"data"."id" IN (SELECT "userId" FROM "user_donations" WHERE "status" IN (
        '${DONATION_STATUS.COMPLETED}',
        '${DONATION_STATUS.SETTLED}'
      ))`,
    )

    results.condition.select([
      '"data"."id"',
      '"data"."username"',
      '"data"."account_type"',
      '"data"."account_status"',
      '"data"."is_verified"',
      '"data"."display_name"',
      '"data"."rank"',
      '"profile"."id" AS "profile_id"',
      '"profile_images"."url" AS "profile_image"',

      `(SELECT COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0) 
          FROM "user_donations" "donation" 
          WHERE "donation"."userId" = "data"."id" AND "donation"."reason" IN (
            '${DonationType.AUCTION}',
            '${DonationType.BUYNOW}',
            '${DonationType.RAFFLE}'
          ) AND "donation"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          ) ${donationRangeQuery}) AS "total_net_donation"`,

      `(SELECT COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0) 
          FROM "user_donations" "donation" 
          WHERE "donation"."userId" = "data"."id" AND "donation"."reason" IN (
            '${DonationType.BUYNOW}',
            '${DonationType.RAFFLE}',
            '${DonationType.AUCTION}'
          ) AND "donation"."status" IN (
            '${DONATION_STATUS.COMPLETED}',
            '${DONATION_STATUS.SETTLED}'
          ) ${donationRangeQuery}) AS "total_gross_donation"`,

      `(SELECT COALESCE(SUM("item_payment"."deal_amount"), 0) 
          FROM "user_deal_item_payment" "item_payment" 
          WHERE "item_payment"."senderId" = "data"."id" 
          AND "item_payment"."status" IN (
            '${PAYMENT_STATUS.COMPLETED}',
            '${PAYMENT_STATUS.DONATION_SETTLED}'
          ) ${purchaseRangeQuery}) AS "total_purchases"`,

      `(SELECT COALESCE(COUNT(DISTINCT "item_payment"."dealId"), 0) 
          FROM "user_deal_item_payment" "item_payment" 
          WHERE "item_payment"."senderId" = "data"."id" 
          AND "item_payment"."status" IN (
            '${PAYMENT_STATUS.COMPLETED}',
            '${PAYMENT_STATUS.DONATION_SETTLED}'
          ) ${purchaseRangeQuery}) AS "total_unique_deal_purchases"`,
    ])

    results.condition.orderBy({
      [`"total_purchases"`]: 'DESC',
    })

    if (isExport) {
      const data = await results.condition.getRawMany()

      const csvData: [] = data.map((item) => ({
        'Donor id': item.userId,
        'Total amount': item.total_amount,
        Username: item.username,
        'User rank': item.rank,
        'Account type': item.account_type,
        'Total net donation': item.total_net_donation,
        'Total gross donation': item.total_gross_donation,
        'Total participation': item.total_purchases,
        'Total purchase': item.total_unique_deal_purchases,
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
