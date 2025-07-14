import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { CheckNonprofitDonationQuery, GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/nonprofit/payment/dto'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (
  query: QueryDto,
  userId: string,
  isExport = false,
): Promise<PaginateRO> {
  try {
    let deal_image = GetDealFirstImageQuery('"deal"."deal_type"', '"deal"."id"')

    deal_image = deal_image.replace('AS "deal_image"', '')

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('user_donation_payment')
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.payment')
      .addRelation('donation_project')
      .create()

    results.condition.andWhere('"data"."status" IN (:...donation_status)', {
      donation_status: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    results.condition.andWhere(CheckNonprofitDonationQuery('"data"', userId))

    results.condition.select([
      `"data"."id" AS "id"`,
      '"data"."amount" AS "amount"',
      '"data"."reason" AS "reason"',
      '"data"."status" AS "status"',
      '"data"."created" AS "donation_date"',
      '"data"."system_fees" AS "system_fees"',
      '"user"."id" AS "user_id"',
      '"user"."display_name" AS "user_display_name"',
      '"user"."username" AS "user_username"',
      '"profile"."social_accounts" AS "social_accounts"',
      `CASE
        WHEN "data"."reason" = '${DonationType.BUYNOW}' THEN (
          SELECT
            json_agg(
              json_build_object(
                'name', "deal"."name",
                'deal_image', ${deal_image}
              )
            )
          FROM "user_deal_buynow_cart_items" "items"
          JOIN "deals" "deal" ON "deal"."id" = "items"."dealId"
          WHERE "items"."cartId" = "payment"."cartId"
        )
        WHEN "data"."reason" IN ('${DonationType.RAFFLE}', '${DonationType.AUCTION}') THEN (
          SELECT
            json_agg(
              json_build_object(
                'name', "deal"."name",
                'deal_image', ${deal_image}
              )
            )
          FROM "user_deal_item_payment" "item_payment"
          JOIN "deals" "deal" ON "deal"."id" = "item_payment"."dealId"
          WHERE "item_payment"."paymentId" = "payment"."id"
        )
        WHEN "data"."reason" IN ('${DonationType.FUNDRAISER_FORM}', '${DonationType.FUNDRAISER_PAGE}') THEN (
          SELECT json_build_object('name', f."title")
          FROM "re2_fundraisers" f
          WHERE f."id" = "user_donation_payment"."reference_id"
            AND f."type"::text = (
              CASE
                WHEN "data"."reason" = '${DonationType.FUNDRAISER_FORM}' THEN '${FundraiserType.FORM}'
                WHEN "data"."reason" = '${DonationType.FUNDRAISER_PAGE}' THEN '${FundraiserType.PAGE}'
              END
            )
        )
        WHEN "data"."reason" IN (
          '${DonationType.INTEGRATION_CART_BANNER}',
          '${DonationType.INTEGRATION_CART_DRAWER}',
          '${DonationType.INTEGRATION_SALES_PORTION}'
        ) THEN (
          SELECT json_build_object('name', s."name")
          FROM (
            SELECT cb."name" FROM "re2_shopify_cart_banner_settings" cb WHERE cb."id" = "user_donation_payment"."reference_id"
            UNION ALL
            SELECT cd."name" FROM "re2_shopify_cart_drawer_settings" cd WHERE cd."id" = "user_donation_payment"."reference_id"
            UNION ALL
            SELECT sp."name" FROM "re2_shopify_sale_portion_settings" sp WHERE sp."id" = "user_donation_payment"."reference_id"
          ) s
        )
      END AS "source_info"`,
      `COALESCE(
        "payment"."cartId",
        "payment"."rafflePurchaseId",
        "payment"."bidId",
        "user_donation_payment"."reference_id"
      ) AS "source_id"`,
    ])

    results.condition.groupBy(
      `"data"."id",
      "user"."id",
      "profile"."id",
      "payment"."id",
      "donation_project"."id",
      "user_donation_payment"."reference_id"`,
    )

    if (query?.donation_date?.leading_date && query?.donation_date?.trailing_date) {
      results.condition.andWhere('"data"."created" BETWEEN :start_date AND :end_date', {
        start_date: query.donation_date.leading_date,
        end_date: query.donation_date.trailing_date,
      })
    } else if (query?.donation_date?.leading_date) {
      results.condition.andWhere('"data"."created" >= :start_date', {
        start_date: query.donation_date.leading_date,
      })
    } else if (query?.donation_date?.trailing_date) {
      results.condition.andWhere('"data"."created" <= :end_date', {
        end_date: query.donation_date.trailing_date,
      })
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        return
      }

      const csvData = data.map((item: any) => ({
        'Donor ID': item.user_id,
        'Donor Name': item.user_display_name,
        'Donor Username': item.user_username,
        'Donation Date': item.donation_date,
        'Donation Amount': item.amount,
        'Donation Reason': item.reason,
        'Source Info': JSON.stringify(item.source_info),
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
