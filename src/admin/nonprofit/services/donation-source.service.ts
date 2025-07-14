import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetDealQuantityQuery,
  GetTotalDealSalesQuery,
  CheckNonprofitDonationQuery,
} from '@app/src/shared/sql'
import { DealType } from '@app/src/users/deal/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (userId: string, query: MyPaginateDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.deal')
      .addRelation('user_donation_payment')
      .addRelation('user')
      .useQuery(this.donationRepository)
      .create()

    results.condition.andWhere(`"data"."status" IN (:...stList)`, {
      stList: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    results.condition.andWhere('"data"."reason" != :direct', {
      direct: DonationType.DIRECT_DONATION,
    })

    results.condition.select([
      `"data"."reason" AS "reason"`,
      `
        CASE
          WHEN "data"."reason" IN (
            '${DonationType.BUYNOW}',
            '${DonationType.RAFFLE}',
            '${DonationType.AUCTION}'
          )
            THEN CAST("deal"."id" AS text)
          ELSE CAST("user_donation_payment"."reference_id" AS text)
        END
      AS "source_id"
      `,

      `SUM("data"."amount") AS "total_donation"`,
      `COUNT(DISTINCT "data"."userId") AS "total_donors"`,

      `
        CASE
          WHEN "data"."reason" IN (
            '${DonationType.BUYNOW}',
            '${DonationType.RAFFLE}',
            '${DonationType.AUCTION}'
          )
            THEN json_build_object(
              'sourceType', "data"."reason",
              'dealId', "deal"."id",
              'dealName', "deal"."name",
              'dealType', "deal"."deal_type",
              'start_date', "deal"."start_date",
              'end_date', "deal"."end_date",
              'status', "deal"."status",
              'description', "deal"."description",
              'starting_price', "deal"."starting_price",
              'total_raffle_sales', (
                ${GetTotalDealSalesQuery({
                  dealId: '"deal"."id"',
                  dealType: DealType.RAFFLE,
                })}
              ),
              'current_bid', (
                SELECT MAX(b."bid_amount")
                FROM "user_deal_bids" b
                WHERE b."dealId" = "deal"."id"
              ),
              'participants', (
                ${GetTotalDealSalesQuery({
                  dealId: '"deal"."id"',
                  select: 'COALESCE(COUNT(DISTINCT "payment"."userId"), 0)',
                })}
              ),
              'total_sales', (
                ${GetTotalDealSalesQuery({
                  select: 'COALESCE(SUM("payment"."deal_amount"), 0)',
                  dealId: '"deal"."id"',
                })}
              ),
              'remaining_quantity', (
                ${GetDealQuantityQuery('"deal"."id" = "deals"."id"')}
              )
            )

          ELSE (
            CASE
              WHEN "data"."reason" IN (
                '${DonationType.FUNDRAISER_FORM}',
                '${DonationType.FUNDRAISER_PAGE}'
              )
                THEN (
                  SELECT json_build_object(
                    'sourceType', "data"."reason",
                    'title', f."title",
                    'public_url', f."public_url",
                    'company_name', p."company_name",
                    'total_donation', SUM("data"."amount"),
                    'total_donors', COUNT(DISTINCT "data"."userId")
                  )
                  FROM "re2_fundraisers" f
                  JOIN "re2_users" uf ON uf."id" = f."userId"
                  JOIN "re2_profiles" p ON p."userId" = uf."id"
                  WHERE f."id" = "user_donation_payment"."reference_id"
                    AND f."type"::text = (
                      CASE
                        WHEN "data"."reason" = '${DonationType.FUNDRAISER_FORM}'
                          THEN '${FundraiserType.FORM}'
                        WHEN "data"."reason" = '${DonationType.FUNDRAISER_PAGE}'
                          THEN '${FundraiserType.PAGE}'
                      END
                    )
                )

              WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
                THEN (
                  SELECT json_build_object(
                    'sourceType', "data"."reason",
                    'title', cb."name",
                    'public_url', 'https://' || si."shop",
                    'company_name', p."company_name",
                    'total_donation', SUM("data"."amount"),
                    'total_donors', COUNT(DISTINCT "data"."userId")
                  )
                  FROM "re2_shopify_cart_banner_settings" cb
                  JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
                  JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
                  JOIN "re2_profiles" p ON i2."userId" = p."userId"
                  WHERE cb."id" = "user_donation_payment"."reference_id"
                )

              WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}'
                THEN (
                  SELECT json_build_object(
                    'sourceType', "data"."reason",
                    'title', cd."name",
                    'public_url', 'https://' || si."shop",
                    'company_name', p."company_name",
                    'total_donation', SUM("data"."amount"),
                    'total_donors', COUNT(DISTINCT "data"."userId")
                  )
                  FROM "re2_shopify_cart_drawer_settings" cd
                  JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
                  JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
                  JOIN "re2_profiles" p ON i2."userId" = p."userId"
                  WHERE cd."id" = "user_donation_payment"."reference_id"
                )

              WHEN "data"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}'
                THEN (
                  SELECT json_build_object(
                    'sourceType', "data"."reason",
                    'title', sp."name",
                    'public_url', 'https://' || si."shop",
                    'company_name', p."company_name",
                    'total_donation', SUM("data"."amount"),
                    'total_donors', COUNT(DISTINCT "data"."userId")
                  )
                  FROM "re2_shopify_sale_portion_settings" sp
                  JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
                  JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
                  JOIN "re2_profiles" p ON i2."userId" = p."userId"
                  WHERE sp."id" = "user_donation_payment"."reference_id"
                )

              ELSE json_build_object(
                'sourceType', 'unknown_re2_source',
                'total_donation', SUM("data"."amount"),
                'total_donors', COUNT(DISTINCT "data"."userId")
              )
            END
          )
        END
      AS "source_details"
      `,
    ])

    results.condition.addGroupBy(`"data"."reason"`)
    results.condition.addGroupBy(`"deal"."id"`)
    results.condition.addGroupBy(`"user_donation_payment"."reference_id"`)

    results.condition.andWhere(CheckNonprofitDonationQuery('data', userId))

    results.condition.orderBy({
      total_donation: 'DESC',
    })

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
