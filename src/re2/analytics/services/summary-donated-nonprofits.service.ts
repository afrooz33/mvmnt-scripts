import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'
import { GetRe2SourceDonationQuery } from '@app/src/shared/sql'

export default async function (query: Re2AnalyticQueryDto, userId: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.nonprofitUserRepository)
      .addRelation('profile')
      .addFilter('account_status', AccountStatus.DELETED, true)
      .create()

    results.condition.select([
      'data.id id',
      'profile.first_name first_name',
      'profile.last_name last_name',
      'profile.foundation_name foundation_name',
      'profile.foundation_url foundation_url',
      `(
        SELECT
          JSON_BUILD_OBJECT(
            'gross_donation', gross_donation,
            'net_donation', net_donation
          )
          FROM (
            ${GetRe2SourceDonationQuery({
              re2Id: userId,
              isDirect: true,
              nonprofitId: '"data"."id"',
              dateFilter: {
                start: query?.date_filter?.start,
                end: query?.date_filter?.end,
              },
              select:
                'COALESCE(SUM("donation"."amount" - "donation"."system_fees"), 0) gross_donation, COALESCE(SUM("donation"."amount"), 0) net_donation',
            })}
          )
      ) as donation`,
    ])

    results.condition.andWhere(
      `"data"."id" IN (
        SELECT "fundraiser_nonprofit"."nonprofitUsersId" FROM "re2_fundraisers_nonprofit_users" "fundraiser_nonprofit"
        LEFT JOIN "re2_fundraisers" "fundraiser" ON "fundraiser"."id" = "fundraiser_nonprofit"."re2FundraisersId"
        WHERE "fundraiser"."userId" = :re2Id

        UNION ALL

        SELECT "sales_portion"."nonprofitUsersId" FROM "re2_shopify_sale_portion_nonprofits" "sales_portion"
        LEFT JOIN "re2_shopify_sale_portion_settings" "settings" ON "settings"."id" = "sales_portion"."re2ShopifySalePortionSettingsId"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "settings"."shopifyIntegrationId"
        WHERE "shopify_integration"."integrationId" = :re2Id

        UNION ALL

        SELECT "cart_banner"."nonprofitUsersId" FROM "re2_shopify_cart_banner_nonprofits" "cart_banner"
        LEFT JOIN "re2_shopify_cart_banner_settings" "settings" ON "settings"."id" = "cart_banner"."re2ShopifyCartBannerSettingsId"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "settings"."shopifyIntegrationId"
        WHERE "shopify_integration"."integrationId" = :re2Id

        UNION ALL

        SELECT "cart_drawer"."nonprofitUsersId" FROM "re2_shopify_cart_drawer_nonprofits" "cart_drawer"
        LEFT JOIN "re2_shopify_cart_drawer_settings" "settings" ON "settings"."id" = "cart_drawer"."re2ShopifyCartDrawerSettingsId"
        LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "shopify_integration"."id" = "settings"."shopifyIntegrationId"
        WHERE "shopify_integration"."integrationId" = :re2Id
      )`,
      {
        re2Id: userId,
      },
    )

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        foundation_name: item.foundation_name,
        foundation_url: item.foundation_url,
        gross_donation: item.donation.gross_donation,
        net_donation: item.donation.net_donation,
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
