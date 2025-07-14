import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/receipts/dto'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (
  query: QueryDto,
  userId: string,
  isExport: boolean = false,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('user_donation_payment')
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.payment')
      .addRelation('payment.payment_currency')
      .addRelation('donation_project')
      .addFilter('user', userId)
      .create()

    results.condition.andWhere('"data"."status" IN (:...donation_status)', {
      donation_status: [DONATION_STATUS.SETTLED],
    })

    if (query?.year) {
      results.condition.andWhere('EXTRACT(YEAR FROM "data"."created") = :year', {
        year: query.year,
      })
    }

    if (query?.source_ids) {
      results.condition.andWhere(
        `(COALESCE(
        "payment"."cartId",
        "payment"."rafflePurchaseId",
        "payment"."bidId",
        "user_donation_payment"."reference_id"
      )) IN (:...source_ids)`,
        {
          source_ids: Array.isArray(query.source_ids) ? query.source_ids : [query.source_ids],
        },
      )
    }

    results.condition.select([
      'MAX("data"."created") AS "latest_donation_date"',
      'SUM("data"."amount") AS "total_donation"',
      'data.reason',
      `(SELECT JSON_BUILD_OBJECT(
        'id', "payment_currency"."id",
        'name', "payment_currency"."name",
        'address', "payment_currency"."address",
        'logo_uri', "payment_currency"."logo_uri"
      )) AS "payment_info"`,
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'id', "donation_project"."id",
            'name', "donation_project"."name",
            'nonprofit_id', "nu"."id",
            'profile', JSON_BUILD_OBJECT(
              'id', "np"."id",
              'foundation_name', "np"."foundation_name",
              'foundation_url', "np"."foundation_url",
              'profile_image', JSON_BUILD_OBJECT(
                'id', "i"."id",
                'url', "i"."url"
              )
            )
          )
        FROM
          "nonprofit_users" "nu"
        LEFT JOIN "nonprofit_profiles" "np" ON "np"."userId" = "nu"."id"
        LEFT JOIN "images" "i" ON "i"."id" = "np"."profileImageId"
        WHERE
          "nu"."id" = "donation_project"."userId"
        LIMIT 1
      ) AS "donation_project"`,
      `CASE
        WHEN "data"."reason" = '${DonationType.BUYNOW}' THEN (
          SELECT json_agg(json_build_object('name', "deal"."name"))
          FROM "user_deal_buynow_cart_items" "items"
          JOIN "deals" "deal" ON "deal"."id" = "items"."dealId"
          WHERE "items"."cartId" = "payment"."cartId"
        )
        WHEN "data"."reason" IN ('${DonationType.RAFFLE}', '${DonationType.AUCTION}') THEN (
          SELECT json_agg(json_build_object('name', "d"."name"))
          FROM "user_deal_item_payment" "item_payment"
          JOIN "deals" "d" ON "d"."id" = "item_payment"."dealId"
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
      `"source_id",
      "data"."reason",
      "payment"."cartId",
      "payment"."id",
      "user_donation_payment"."reference_id",
      "donation_project"."id",
      "payment_currency"."id"`,
    )

    results.condition.orderBy('"latest_donation_date"', 'DESC')

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        return
      }

      const csvData = data.map((item: any) => ({
        'Nonprofit ID': item.donation_project.nonprofit_id,
        'Total Donation': item.total_donation,
        'Latest Donation Date': item.latest_donation_date,
        'Foundation Name': item.donation_project.profile.foundation_name,
        'Foundation URL': item.donation_project.profile.foundation_url,
        'Payment Info': JSON.stringify(item.payment_info),
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
