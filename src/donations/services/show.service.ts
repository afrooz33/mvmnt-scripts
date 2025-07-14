import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { CheckNonprofitDonationQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DonateTo, DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (
  id: string,
  donated_to: DonateTo,
  query: MyPaginateDto,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .addRelation('user_donation_payment')
      .addRelation('user_deal_item_payment')
      .addRelation('user_deal_item_payment.payment')
      .addRelation('donation_project')
      .create()

    if (donated_to === DonateTo.NONPROFIT) {
      results.condition.andWhere(CheckNonprofitDonationQuery('data', id))
    }

    if (donated_to === DonateTo.DONATION_PROJECT) {
      results.condition.andWhere('"data"."donationProjectId" = :id', { id })
    }

    results.condition.andWhere('"data"."status" IN (:...status)', {
      status: [DONATION_STATUS.COMPLETED, DONATION_STATUS.SETTLED],
    })

    results.condition.select([
      `"data"."id" AS "id"`,
      '"data"."amount" AS "amount"',
      '"data"."reason" AS "reason"',
      '"data"."status" AS "status"',
      '"data"."created" AS "donation_date"',
      '"data"."system_fees" AS "system_fees"',
      '"data"."is_recurring" AS "is_recurring"',
      '"user"."id" AS "user_id"',
      '"user"."username" AS "user_username"',
      '"profile_images"."url" AS "profile_image"',
      `CASE
        WHEN "data"."reason" = '${DonationType.DIRECT_DONATION}'
          THEN (
            SELECT json_build_object(
              'sourceType', "data"."reason",
              'donation_project', JSON_BUILD_OBJECT(
                'id', dp."id",
                'name', dp."name",
                'description', dp."description",
                'status', dp."status",
                'nonprofit', JSON_BUILD_OBJECT(
                  'id', nu."id",
                  'profile', JSON_BUILD_OBJECT(
                    'id', np."id",
                    'foundation_url', np."foundation_url",
                    'foundation_name', np."foundation_name"
                  )
                )
              )
            )
            FROM "donation_projects" dp
            JOIN "nonprofit_users" nu ON nu."id" = dp."userId"
            JOIN "nonprofit_profiles" np ON np."userId" = nu."id"
            WHERE dp."id" = "data"."donationProjectId"
            LIMIT 1
          )

        WHEN "data"."reason" = '${DonationType.BUYNOW}' THEN (
          SELECT
            json_agg(
              json_build_object(
                'name', "deal"."name",
                'deal_type', "deal"."deal_type",
                'user', json_build_object(
                  'id', "u"."id",
                  'username', "u"."username",
                  'profile', json_build_object(
                    'id', "i"."id",
                    'profile_image', "i"."url"
                  )
                )
              )
            )
          FROM "user_deal_buynow_cart_items" "items"
          JOIN "deals" "deal" ON "deal"."id" = "items"."dealId"
          JOIN "users" "u" ON "u"."id" = "deal"."userId"
          JOIN "user_profiles" "up" ON "up"."userId" = "u"."id"
          JOIN "images" "i" ON "i"."id" = "up"."profileImagesId"
          WHERE "items"."cartId" = "payment"."cartId"
        )
        WHEN "data"."reason" IN ('${DonationType.RAFFLE}', '${DonationType.AUCTION}') THEN (
          SELECT
            json_build_object(
              'name', "deal"."name",
              'deal_type', "deal"."deal_type",
              'user', json_build_object(
                'id', "u"."id",
                'username', "u"."username",
                'profile', json_build_object(
                  'id', "i"."id",
                  'profile_image', "i"."url"
                )
              )
            )
          FROM "user_deal_item_payment" "item_payment"
          JOIN "deals" "deal" ON "deal"."id" = "item_payment"."dealId"
          JOIN "users" "u" ON "u"."id" = "deal"."userId"
          JOIN "user_profiles" "up" ON "up"."userId" = "u"."id"
          JOIN "images" "i" ON "i"."id" = "up"."profileImagesId"
          WHERE "item_payment"."paymentId" = "payment"."id"
        )

        WHEN "data"."reason" IN (
          '${DonationType.FUNDRAISER_FORM}',
          '${DonationType.FUNDRAISER_PAGE}'
        )
        THEN (
          SELECT json_build_object(
            'sourceType', "data"."reason",
            'title', f."title",
            'public_url', f."public_url",
            'company_name', p."company_name"
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
      END AS "source_info"`,
    ])

    results.condition.groupBy(
      `"data"."id",
      "profile_images"."id",
      "user"."id",
      "profile"."id",
      "payment"."id",
      "donation_project"."id",
      "user_donation_payment"."reference_id"`,
    )

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
