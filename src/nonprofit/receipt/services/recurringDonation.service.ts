import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { CheckNonprofitDonationQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationType } from '@app/src/donations/enums'
import { RecurringQueryDto } from '@app/src/nonprofit/receipt/dto'

/**
 * Generates the CASE expression for summing recurring donations, based
 * on whether it’s attached to a Deal, Fundraiser, or Integration.
 */
function getTotalDonationsCase(tableAlias: string): string {
  return `
    CASE
      WHEN "${tableAlias}"."dealId" IS NOT NULL THEN (
        SELECT SUM("donation_amount")
        FROM "recurring_donation_settings"
        WHERE "dealId" = "${tableAlias}"."dealId"
      )
      WHEN "${tableAlias}"."fundraiserId" IS NOT NULL THEN (
        SELECT SUM("donation_amount")
        FROM "recurring_donation_settings"
        WHERE "fundraiserId" = "${tableAlias}"."fundraiserId"
      )
      WHEN "${tableAlias}"."integrationId" IS NOT NULL THEN (
        SELECT SUM("donation_amount")
        FROM "recurring_donation_settings"
        WHERE "integrationId" = "${tableAlias}"."integrationId"
      )
    END
  `
}

/**
 * Returns a CASE expression that picks out the “name” or “title” from
 * deals, fundraisers, or shopify integrations (cart banner, drawer, sales portion).
 */
function getNameCase(tableAlias: string): string {
  return `
    CASE
      WHEN "${tableAlias}"."dealId" IS NOT NULL THEN (
        SELECT deal."name"
        FROM "deals" deal
        WHERE deal."id" = "${tableAlias}"."dealId"
        LIMIT 1
      )
      WHEN "${tableAlias}"."fundraiserId" IS NOT NULL THEN (
        SELECT f."title"
        FROM "re2_fundraisers" f
        WHERE f."id" = "${tableAlias}"."fundraiserId"
        LIMIT 1
      )
      WHEN "${tableAlias}"."integrationId" IS NOT NULL THEN (
        CASE
          WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_CART_BANNER}' THEN (
            SELECT cb."name"
            FROM "re2_shopify_cart_banner_settings" cb
            WHERE cb."id" = "${tableAlias}"."integrationId"
            LIMIT 1
          )
          WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}' THEN (
            SELECT cd."name"
            FROM "re2_shopify_cart_drawer_settings" cd
            WHERE cd."id" = "${tableAlias}"."integrationId"
            LIMIT 1
          )
          WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}' THEN (
            SELECT sp."name"
            FROM "re2_shopify_sale_portion_settings" sp
            WHERE sp."id" = "${tableAlias}"."integrationId"
            LIMIT 1
          )
        END
      )
    END
  `
}

/**
 * Returns a CASE expression for either fundraiser.public_url OR
 * integration => 'https://shopName'.
 */
function getPublicUrlCase(tableAlias: string): string {
  return `
    CASE
      WHEN "${tableAlias}"."fundraiserId" IS NOT NULL THEN (
        SELECT f."public_url"
        FROM "re2_fundraisers" f
        WHERE f."id" = "${tableAlias}"."fundraiserId"
        LIMIT 1
      )
      WHEN "${tableAlias}"."integrationId" IS NOT NULL THEN (
        CASE
          WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_CART_BANNER}' THEN (
            SELECT 'https://' || si."shop"
            FROM "re2_shopify_cart_banner_settings" cb
            JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
            WHERE cb."id" = "${tableAlias}"."integrationId"
            LIMIT 1
          )
          WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}' THEN (
            SELECT 'https://' || si."shop"
            FROM "re2_shopify_cart_drawer_settings" cd
            JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
            WHERE cd."id" = "${tableAlias}"."integrationId"
            LIMIT 1
          )
          WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}' THEN (
            SELECT 'https://' || si."shop"
            FROM "re2_shopify_sale_portion_settings" sp
            JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
            WHERE sp."id" = "${tableAlias}"."integrationId"
            LIMIT 1
          )
        END
      )
    END
  `
}

export default async function (
  query: RecurringQueryDto,
  userId: string,
  isExport: boolean = false,
): Promise<PaginateRO> {
  try {
    const tableAlias = 'data'
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.recurringDonationsRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('profile.profile_images')
      .create()

    results.condition.andWhere(CheckNonprofitDonationQuery(tableAlias, userId))

    results.condition.select([
      `${tableAlias}.id AS id`,
      `${tableAlias}.created AS start_date`,
      `${tableAlias}.donation_amount AS donation_amount`,
      `(SELECT JSON_BUILD_OBJECT(
        'id', "user"."id",
        'display_name', "user"."display_name",
        'username', "user"."username",
        'profile', JSON_BUILD_OBJECT(
          'id', "profile"."id",
          'profile_image', "profile_images"."url",
          'social_accounts', "profile"."social_accounts"
        )
      )) AS user_info`,
      `(
        SELECT "signature"."usage_date"
        FROM "recurring_donation_signatures" "signature"
        WHERE
          "${tableAlias}"."id" = "signature"."settingId"
          AND "signature"."is_consumed" = false
          AND "usage_date" > CURRENT_DATE
        ORDER BY "usage_date" ASC
        LIMIT 1
      ) AS next_date`,
      `CASE
        WHEN "${tableAlias}"."dealId" IS NOT NULL THEN (
          SELECT JSON_BUILD_OBJECT(
            'type', 'deal',
            'id', deal."id",
            'name', deal."name",
            'image', (
              SELECT "images"."url"
              FROM "deal_variants_images_images" dvii
              LEFT JOIN "images" ON dvii."imagesId" = "images"."id"
              LEFT JOIN "deal_variants" dv ON dvii."dealVariantsId" = dv."id"
              WHERE dv."dealId" = deal."id"
              LIMIT 1
            )
          )
          FROM "deals" deal
          WHERE deal."id" = "${tableAlias}"."dealId"
          LIMIT 1
        )
        WHEN "${tableAlias}"."fundraiserId" IS NOT NULL THEN (
          SELECT JSON_BUILD_OBJECT(
            'type', 'fundraiser',
            'id', f."id",
            'title', f."title",
            'public_url', f."public_url"
          )
          FROM "re2_fundraisers" f
          WHERE f."id" = "${tableAlias}"."fundraiserId"
          LIMIT 1
        )
        WHEN "${tableAlias}"."integrationId" IS NOT NULL THEN (
          CASE
            WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_CART_BANNER}' THEN (
              SELECT JSON_BUILD_OBJECT(
                'type', 'cart_banner',
                'id', cb."id",
                'name', cb."name",
                'public_url', 'https://' || si."shop"
              )
              FROM "re2_shopify_cart_banner_settings" cb
              JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
              WHERE cb."id" = "${tableAlias}"."integrationId"
            )
            WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}' THEN (
              SELECT JSON_BUILD_OBJECT(
                'type', 'cart_drawer',
                'id', cd."id",
                'name', cd."name",
                'public_url', 'https://' || si."shop"
              )
              FROM "re2_shopify_cart_drawer_settings" cd
              JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
              WHERE cd."id" = "${tableAlias}"."integrationId"
            )
            WHEN "${tableAlias}"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}' THEN (
              SELECT JSON_BUILD_OBJECT(
                'type', 'sale_portion',
                'id', sp."id",
                'name', sp."name",
                'public_url', 'https://' || si."shop"
              )
              FROM "re2_shopify_sale_portion_settings" sp
              JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
              WHERE sp."id" = "${tableAlias}"."integrationId"
            )
          END
        )
      END AS source_info`,
      `${getTotalDonationsCase(tableAlias)} AS total_donations`,
    ])

    if (query?.donation_date?.start && query?.donation_date?.end) {
      results.condition.andWhere(`"${tableAlias}"."created" BETWEEN :start_date AND :end_date`, {
        start_date: query.donation_date.start,
        end_date: query.donation_date.end,
      })
    } else if (query?.donation_date?.start) {
      results.condition.andWhere(`"${tableAlias}"."created" >= :start_date`, {
        start_date: query.donation_date.start,
      })
    } else if (query?.donation_date?.end) {
      results.condition.andWhere(`"${tableAlias}"."created" <= :end_date`, {
        end_date: query.donation_date.end,
      })
    }

    if (query?.next_donation?.start && query?.next_donation?.end) {
      results.condition.andWhere(
        `"${tableAlias}"."donation_amount" BETWEEN :start_amount AND :end_amount`,
        {
          start_amount: query.next_donation.start,
          end_amount: query.next_donation.end,
        },
      )
    } else if (query?.next_donation?.start) {
      results.condition.andWhere(`"${tableAlias}"."donation_amount" >= :start_amount`, {
        start_amount: query.next_donation.start,
      })
    } else if (query?.next_donation?.end) {
      results.condition.andWhere(`"${tableAlias}"."donation_amount" <= :end_amount`, {
        end_amount: query.next_donation.end,
      })
    }

    const totalDonationsCase = getTotalDonationsCase(tableAlias)

    if (query?.total_donations?.start && query?.total_donations?.end) {
      results.condition.andWhere(
        `(${totalDonationsCase}) BETWEEN :start_donations AND :end_donations`,
        {
          start_donations: query.total_donations.start,
          end_donations: query.total_donations.end,
        },
      )
    } else if (query?.total_donations?.start) {
      results.condition.andWhere(`(${totalDonationsCase}) >= :start_donations`, {
        start_donations: query.total_donations.start,
      })
    } else if (query?.total_donations?.end) {
      results.condition.andWhere(`(${totalDonationsCase}) <= :end_donations`, {
        end_donations: query.total_donations.end,
      })
    }

    if (query?.keyword) {
      const keyword = `%${query.keyword}%`
      const nameCase = getNameCase(tableAlias)
      const publicUrlCase = getPublicUrlCase(tableAlias)

      results.condition.andWhere(
        `(
          "user"."username" ILIKE :keyword
          OR
          "user"."display_name" ILIKE :keyword
          OR
          ${nameCase} ILIKE :keyword
          OR
          ${publicUrlCase} ILIKE :keyword
        )`,
        { keyword },
      )
    }

    if (isExport) {
      const data: [] = await results.condition.getRawMany()

      if (!data.length) {
        return
      }

      const csvData = data.map((item: any) => ({
        'Donor ID': item.user_info.id,
        'Donor Name': item.user_info.display_name,
        'Donor Username': item.user_info.username,
        'Next Donation Date': item.next_date,
        'Donation Amount': item.donation_amount,
        'Donation Start Date': item.start_date,
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
