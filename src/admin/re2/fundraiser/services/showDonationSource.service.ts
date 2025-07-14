import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetNetOrGrossDonationField, GetRe2DonationQuery } from '@app/src/shared/sql'
import { DonationType } from '@app/src/donations/enums'
import { FundraiserStatus } from '@app/src/re2/fundraisers/enums'
import { QueryDonationSourceDto } from '@app/src/admin/re2/fundraiser/dto'
import { IntegrationStatus, IntegrationType } from '@app/src/re2/integrations/enums'
import {
  GetNonprofitDataSql,
  GetFundraiserKeywordSql,
  GetTotalRecordsCountSql,
  GetDonationProjectDataSql,
  BuildKeywordExistsCondition,
} from '@app/src/admin/re2/fundraiser/helpers'

export default async function (
  query: QueryDonationSourceDto,
  isExport: boolean = false,
): Promise<any> {
  try {
    let fundraiserCondition = ` WHERE "fundraiser"."status"::text NOT IN ('${FundraiserStatus.DRAFT}', '${FundraiserStatus.PREVIEW}', '${FundraiserStatus.DELETED}')`

    let integrationCondition = ` WHERE "integration"."type"::text = '${IntegrationType.SHOPIFY}' AND "integration"."status"::text != '${IntegrationStatus.DELETED}'`

    let cartBannerKeywordCondition = ''
    let cartDrawerKeywordCondition = ''
    let salesPortionKeywordCondition = ''

    if (query?.status) {
      fundraiserCondition += ` AND "fundraiser"."status"::text = '${query.status}'`
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

    if (query?.keyword) {
      fundraiserCondition += GetFundraiserKeywordSql(fundraiserCondition, query.keyword)
    }

    if (query?.type) {
      fundraiserCondition += ` ${
        fundraiserCondition ? 'AND' : 'WHERE'
      } "fundraiser"."type"::text = '${query.type}'`

      integrationCondition += ` AND "integration"."type"::text = '${query.type}'`
    }

    if (query?.start_date) {
      if (query.start_date?.leading_date) {
        fundraiserCondition += ` AND "fundraiser"."start_date" >= '${query.start_date?.leading_date}'`
        integrationCondition += ` AND "shopify_integration"."created" >= '${query.start_date?.leading_date}'`
      }

      if (query.start_date?.trailing_date) {
        fundraiserCondition += ` AND "fundraiser"."start_date" <= '${query.start_date?.trailing_date}'`
        integrationCondition += ` AND "shopify_integration"."created" <= '${query.start_date?.trailing_date}'`
      }
    }

    if (query?.gross_donation?.start) {
      fundraiserCondition += ` AND (${GetRe2DonationQuery({
        id: '"fundraiser"."id"',
        donationType: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
      })}) >= ${query.gross_donation?.start}`
    }

    if (query?.gross_donation?.end) {
      fundraiserCondition += ` AND (${GetRe2DonationQuery({
        id: '"fundraiser"."id"',
        donationType: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
      })}) <= ${query.gross_donation?.end}`
    }

    if (query?.gross_donation?.start) {
      integrationCondition += ` AND (${GetRe2DonationQuery({
        id: '"integration"."id"',
        donationType: [
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
      })}) >= ${query.gross_donation?.start}`
    }

    if (query?.gross_donation?.end) {
      integrationCondition += ` AND (${GetRe2DonationQuery({
        id: '"integration"."id"',
        donationType: [
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
      })}) <= ${query.gross_donation?.end}`
    }

    const sql = `SELECT 
      'Fundraiser' AS "section", 
      "fundraiser"."id", 
      "fundraiser"."type" :: TEXT, 
      "fundraiser"."title", 
      "fundraiser"."public_url" AS url, 
      "fundraiser"."status" :: TEXT, 
      "fundraiser"."created", 
      JSONB_BUILD_OBJECT(
        'goal_settings', "fundraiser"."goal_settings", 
        'goal_amount', "fundraiser"."goal_amount", 
        'start_date', "fundraiser"."start_date", 
        'end_date', "fundraiser"."end_date"
      ) AS meta, 
      JSONB_BUILD_OBJECT(
        'gross_donation', (${GetRe2DonationQuery({
          id: '"fundraiser"."id"',
          donationType: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        })}),
        'net_donation', (${GetRe2DonationQuery({
          id: '"fundraiser"."id"',
          donationType: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
        })})
      ) AS donations, 
      (
        ${GetNonprofitDataSql(
          're2_fundraisers_nonprofit_users',
          `"nonprofit"."re2FundraisersId" = "fundraiser"."id"`,
        )}
      ) AS nonprofits, 
      (
        ${GetDonationProjectDataSql(
          're2_fundraisers_donation_projects',
          `"donation_project"."re2FundraisersId" = "fundraiser"."id"`,
        )}
      ) AS donation_projects 
    FROM 
      "re2_fundraisers" "fundraiser"${fundraiserCondition}
    UNION ALL 
    SELECT 
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
        'gross_donation', (${GetRe2DonationQuery({
          id: '"integration"."id"',
          donationType: [
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        })}),
        'net_donation', (${GetRe2DonationQuery({
          id: '"integration"."id"',
          donationType: [
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
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
        'gross_donation', (${GetRe2DonationQuery({
          id: '"integration"."id"',
          donationType: [
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        })}),
        'net_donation', (${GetRe2DonationQuery({
          id: '"integration"."id"',
          donationType: [
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
        })})
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
        'gross_donation', (${GetRe2DonationQuery({
          id: '"integration"."id"',
          donationType: [
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        })}),
        'net_donation', (${GetRe2DonationQuery({
          id: '"integration"."id"',
          donationType: [
            DonationType.INTEGRATION_CART_BANNER,
            DonationType.INTEGRATION_CART_DRAWER,
            DonationType.INTEGRATION_SALES_PORTION,
          ],
          select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
        })})
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
      const data = await this.fundraiserRepository.query(sql)

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

    const data = await this.fundraiserRepository.query(`${sql} LIMIT $1 OFFSET $2`, [limit, offset])

    const totalCountResult = await this.fundraiserRepository.query(
      GetTotalRecordsCountSql(
        fundraiserCondition,
        integrationCondition,
        cartBannerKeywordCondition,
        cartDrawerKeywordCondition,
        salesPortionKeywordCondition,
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
