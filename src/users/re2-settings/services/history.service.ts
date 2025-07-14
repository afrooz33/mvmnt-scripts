import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { GetNetOrGrossDonationField } from '@app/src/shared/sql'

export default async function (query: MyPaginateDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('user_donation_payment')
      .create()

    results.condition.andWhere(`"data"."reason" IN (:...donation_types)`, {
      donation_types: [
        DonationType.FUNDRAISER_FORM,
        DonationType.FUNDRAISER_PAGE,
        DonationType.INTEGRATION_CART_BANNER,
        DonationType.INTEGRATION_CART_DRAWER,
        DonationType.INTEGRATION_SALES_PORTION,
      ],
    })

    results.condition.andWhere(`"data"."status" IN (:...donation_statuses)`, {
      donation_statuses: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    results.condition.andWhere(`"data"."userId" = :donor_id`, {
      donor_id: userId,
    })

    results.condition.select([
      'data.id id',
      'data.created created',
      `${GetNetOrGrossDonationField('data', false)} net_donation`,
      `${GetNetOrGrossDonationField('data', true)} gross_donation`,
      'data.is_recurring is_recurring',
      'data.reason reason',
      'data.status status',
      'data.integration_mode integration_mode',
      `CASE
        WHEN "data"."reason" IN (
          '${DonationType.FUNDRAISER_FORM}',
          '${DonationType.FUNDRAISER_PAGE}'
        )
          THEN (
            SELECT json_build_object(
              'title', f."title",
              'public_url', f."public_url"
            )
            FROM "re2_fundraisers" f
            WHERE f."id" = "user_donation_payment"."reference_id"
          )

        WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
          THEN (
            SELECT json_build_object(
              'title', cb."name",
              'public_url', 'https://' || si."shop"
            )
            FROM "re2_shopify_cart_banner_settings" cb
            JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
            WHERE cb."id" = "user_donation_payment"."reference_id"
          )

        WHEN "data"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}'
          THEN (
            SELECT json_build_object(
              'title', cd."name",
              'public_url', 'https://' || si."shop"
            )
            FROM "re2_shopify_cart_drawer_settings" cd
            JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
            WHERE cd."id" = "user_donation_payment"."reference_id"
          )

        WHEN "data"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}'
          THEN (
            SELECT json_build_object(
              'title', sp."name",
              'public_url', 'https://' || si."shop"
            )
            FROM "re2_shopify_sale_portion_settings" sp
            JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
            WHERE sp."id" = "user_donation_payment"."reference_id"
          )
      END AS "source_details"`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
