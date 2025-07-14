import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (query: MyPaginateDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .addFilter('user', userId)
      .addFilter('status', DONATION_STATUS.COMPLETED)
      .addRelation('payment_currency')
      .addRelation('user_donation_payment')
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.deal')
      .create()

    results.condition.andWhere('"data"."reason" IN (:...reasons)', {
      reasons: [
        DonationType.INTEGRATION_CART_BANNER,
        DonationType.INTEGRATION_CART_DRAWER,
        DonationType.INTEGRATION_SALES_PORTION,
      ],
    })

    results.condition.select([
      'data.id id',
      'data.amount amount',
      'data.reason reason',
      'data.created created',
      'data.is_recurring is_recurring',
      'payment_currency.id payment_currency_id',
      'payment_currency.name payment_currency_name',
      'payment_currency.logo_uri payment_currency_logo_uri',
      `CASE
          WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
            THEN (
              SELECT json_build_object(
                'sourceType', "data"."reason",
                'title', cb."name",
                'public_url', 'https://' || si."shop",
                'company_name', p."company_name"
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
                'company_name', p."company_name"
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
                'company_name', p."company_name"
              )
              FROM "re2_shopify_sale_portion_settings" sp
              JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
              JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
              JOIN "re2_profiles" p ON i2."userId" = p."userId"
              WHERE sp."id" = "user_donation_payment"."reference_id"
            )
        END
      AS "source_details"`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
