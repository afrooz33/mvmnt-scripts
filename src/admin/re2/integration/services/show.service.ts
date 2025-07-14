import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetNetOrGrossDonationField, GetRe2DonationQuery } from '@app/src/shared/sql/common.sql'
import { DonationType } from '@app/src/donations/enums'
import { QueryDonationSourceDto } from '@app/src/admin/re2/fundraiser/dto'
import {
  GetNonprofitDataSql,
  GetTotalRecordsCountSql,
  GetDonationProjectDataSql,
  BuildKeywordExistsCondition,
} from '@app/src/admin/re2/fundraiser/helpers'
import { IntegrationStatus, IntegrationType } from '@app/src/re2/integrations/enums'

export default async function (
  query: QueryDonationSourceDto,
  isExport: boolean = false,
): Promise<any> {
  try {
    let integrationCondition = ` WHERE "integration"."type"::text = '${IntegrationType.SHOPIFY}' AND "shopify_integration"."status"::text != '${IntegrationStatus.DELETED}'`

    let cartBannerKeywordCondition = ''
    let cartDrawerKeywordCondition = ''
    let salesPortionKeywordCondition = ''

    if (query?.status) {
      integrationCondition += ` AND "integration"."status"::text = '${query.status}'`
    }

    if (query?.keyword) {
      cartBannerKeywordCondition = BuildKeywordExistsCondition(
        'nonprofit_profile',
        're2_shopify_cart_banner_nonprofits',
        'nonprofitUsersId',
        'nonprofit_profiles',
        ['first_name', 'last_name', 'foundation_name'],
        query.keyword,
      )

      cartDrawerKeywordCondition = BuildKeywordExistsCondition(
        'project',
        're2_shopify_cart_banner_donation_projects',
        'donationProjectsId',
        'donation_projects',
        ['name'],
        query.keyword,
      )

      salesPortionKeywordCondition = BuildKeywordExistsCondition(
        'nonprofit_profile',
        're2_shopify_sale_portion_nonprofits',
        'nonprofitUsersId',
        'nonprofit_profiles',
        ['first_name', 'last_name', 'foundation_name'],
        query.keyword,
      )
    }

    if (query?.type) {
      integrationCondition += ` AND "integration"."type"::text = '${query.type}'`
    }

    const sql = `SELECT 
      'Integration' AS "section", 
      "integration"."id", 
      "integration"."type" :: TEXT, 
      "portion_settings"."name" AS title, 
      'https://' || "shopify_integration"."shop" AS url, 
      "integration"."status" :: TEXT, 
      "integration"."created", 
      JSONB_BUILD_OBJECT(
        'type', 'Portion of sales', 'name', 
        "portion_settings"."name", 'donationType', 
        "portion_settings"."donation_type", 
        'donationValue', "portion_settings"."donation_value", 
        'nonprofitId', "portion_settings"."nonprofitId", 
        'donationProjectId', "portion_settings"."donationProjectId", 
        'status', "portion_settings"."status"
      ) AS meta, 
      JSONB_BUILD_OBJECT(
        'total_sales', (${GetRe2DonationQuery({
          re2Id: '"integration"."userId"',
          donationType: [
            DonationType.FUNDRAISER_FORM,
            DonationType.FUNDRAISER_PAGE,
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
          isAll: true,
        })}),
        'gross_donation', (${GetRe2DonationQuery({
          re2Id: '"integration"."userId"',
          donationType: [
            DonationType.FUNDRAISER_FORM,
            DonationType.FUNDRAISER_PAGE,
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
          isAll: true,
        })}),
        'net_donation', (${GetRe2DonationQuery({
          re2Id: '"integration"."userId"',
          donationType: [
            DonationType.FUNDRAISER_FORM,
            DonationType.FUNDRAISER_PAGE,
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
          isAll: true,
        })})
      ) AS donations, 
      (
        ${GetNonprofitDataSql(
          're2_shopify_sale_portion_nonprofits',
          `"nonprofit"."re2ShopifySalePortionSettingsId" = "portion_settings"."id"`,
        )}
      ) AS nonprofits, 
      (
        ${GetDonationProjectDataSql(
          're2_shopify_sale_portion_donation_projects',
          `"donation_project"."re2ShopifySalePortionSettingsId" = "portion_settings"."id"`,
        )}
      ) AS donation_projects 
    FROM 
      "re2_integrations" "integration" 
      LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "integration"."id" = "shopify_integration"."integrationId" 
      LEFT JOIN "re2_shopify_sale_portion_settings" "portion_settings" ON "shopify_integration"."id" = "portion_settings"."shopifyIntegrationId" 
      ${integrationCondition}${salesPortionKeywordCondition}
    UNION ALL 
    SELECT 
      'Integration' AS "section", 
      "integration"."id", 
      "integration"."type" :: TEXT, 
      "cart_banner_settings"."name" AS title, 
      'https://' || "shopify_integration"."shop" AS url, 
      "integration"."status" :: TEXT, 
      "integration"."created", 
      JSONB_BUILD_OBJECT(
        'type', 'Cart Banner setting', 'name', 
        "cart_banner_settings"."name", 
        'roundUpTotalStatus', "cart_banner_settings"."round_up_total_status", 
        'addSingleItemStatus', "cart_banner_settings"."add_single_item_status", 
        'roundUpTotalValue', "cart_banner_settings"."round_up_total_value"
      ) AS meta, 
      JSONB_BUILD_OBJECT(
        'total_sales', 100, 'gross_donation', 
        124430, 'net_donation', 124430
      ) AS donations, 
      (
        ${GetNonprofitDataSql(
          're2_shopify_cart_banner_nonprofits',
          `"nonprofit"."re2ShopifyCartBannerSettingsId" = "cart_banner_settings"."id"`,
        )}
      ) AS nonprofits, 
      (
        ${GetDonationProjectDataSql(
          're2_shopify_cart_banner_donation_projects',
          `"donation_project"."re2ShopifyCartBannerSettingsId" = "cart_banner_settings"."id"`,
        )}
      ) AS donation_projects 
    FROM 
      "re2_integrations" "integration" 
      LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "integration"."id" = "shopify_integration"."integrationId" 
      LEFT JOIN "re2_shopify_cart_banner_settings" "cart_banner_settings" ON "shopify_integration"."id" = "cart_banner_settings"."shopifyIntegrationId" 
      ${integrationCondition}${cartBannerKeywordCondition}
    UNION ALL 
    SELECT 
      'Integration' AS "section", 
      "integration"."id", 
      "integration"."type" :: TEXT, 
      "cart_drawer_settings"."name" AS title, 
      'https://' || "shopify_integration"."shop" AS url, 
      "integration"."status" :: TEXT, 
      "integration"."created", 
      JSONB_BUILD_OBJECT(
        'type', 'Cart Drawer setting', 'name', 
        "cart_drawer_settings"."name"
      ) AS meta, 
      JSONB_BUILD_OBJECT(
        'total_sales', 100, 'gross_donation', 
        124430, 'net_donation', 124430
      ) AS donations, 
      (
        ${GetNonprofitDataSql(
          're2_shopify_cart_drawer_nonprofits',
          `"nonprofit"."re2ShopifyCartDrawerSettingsId" = "cart_drawer_settings"."id"`,
        )}
      ) AS nonprofits, 
      (
        ${GetDonationProjectDataSql(
          're2_shopify_cart_drawer_donation_projects',
          `"donation_project"."re2ShopifyCartDrawerSettingsId" = "cart_drawer_settings"."id"`,
        )}
      ) AS donation_projects 
    FROM 
      "re2_integrations" "integration" 
      LEFT JOIN "re2_shopify_integrations" "shopify_integration" ON "integration"."id" = "shopify_integration"."integrationId" 
      LEFT JOIN "re2_shopify_cart_drawer_settings" "cart_drawer_settings" ON "shopify_integration"."id" = "cart_drawer_settings"."shopifyIntegrationId" 
      ${integrationCondition}${cartDrawerKeywordCondition}
    ORDER BY 
      "created" DESC`

    if (isExport) {
      const data = await this.integrationRepository.query(sql)

      const csvData = data.map((item: any) => {
        return {
          Id: item.id,
          Section: item.section,
          Type: item.type,
          Title: item.title,
          Url: item.url,
          Status: item.status,
          'Total sales': item.donation?.total_sales,
          'Net donation': item.donation?.net_donation,
          'Gross donation': item.donation?.gross_donation,
          'Total contribution': item.donation?.total_contributions,
          'Total nonprofits': item.nonprofits?.length,
          'Total donation projects': item.donation_projects?.length,
          Nonprofits: JSON.stringify(item.nonprofits),
          'Donation projects': JSON.stringify(item.donation_projects),
        }
      })

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    const page = Number.parseInt(query.page)
    const limit = Number.parseInt(query.limit)

    const offset = (page - 1) * limit

    const data = await this.integrationRepository.query(`${sql} LIMIT $1 OFFSET $2`, [
      limit,
      offset,
    ])

    const totalCountResult = await this.integrationRepository.query(
      GetTotalRecordsCountSql(
        null,
        integrationCondition,
        cartBannerKeywordCondition,
        cartDrawerKeywordCondition,
        salesPortionKeywordCondition,
        false,
      ),
    )

    const totalRecords = totalCountResult[0]?.total_count || 0

    return {
      data,
      meta: {
        limit,
        next_page: '',
        prev_page: '',
        current_page: page,
        total_record: Number.parseInt(totalRecords),
        total_page: Math.ceil(totalRecords / limit),
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
