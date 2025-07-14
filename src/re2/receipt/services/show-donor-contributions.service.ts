import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/re2/receipt/dto'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'
import { SourceFilter } from '@app/src/re2/analytics/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (
  donor: string,
  query: QueryDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('user')
      .addRelation('user_donation_payment')
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.andWhere(`"data"."userId" = :donor`, {
      donor,
    })

    if (query?.source_id) {
      results.condition.andWhere(`"user_donation_payment"."reference_id" = '${query?.source_id}'`)
    } else {
      const referenceCondition = []

      if (query?.source_filter === SourceFilter.FORM) {
        referenceCondition.push(
          `(SELECT "id" FROM "re2_fundraisers" WHERE "userId" = '${userId}' AND "type" = '${FundraiserType.FORM}')`,
        )
      } else if (query?.source_filter === SourceFilter.PAGE) {
        referenceCondition.push(
          `(SELECT "id" FROM "re2_fundraisers" WHERE "userId" = '${userId}' AND "type" = '${FundraiserType.PAGE}')`,
        )
      } else if (query?.source_filter === SourceFilter.INTEGRATION) {
        referenceCondition.push(
          `(SELECT cbs.id 
            FROM re2_shopify_cart_banner_settings cbs
            JOIN re2_shopify_integrations si ON si.id = cbs."shopifyIntegrationId"
            JOIN re2_integrations i ON i.id = si."integrationId"
            WHERE i."userId" = '${userId}')`,
        )

        referenceCondition.push(
          `(SELECT cds.id 
            FROM re2_shopify_cart_drawer_settings cds
            JOIN re2_shopify_integrations si ON si.id = cds."shopifyIntegrationId"
            JOIN re2_integrations i ON i.id = si."integrationId"
            WHERE i."userId" = '${userId}')`,
        )

        referenceCondition.push(
          `(SELECT sps.id 
            FROM re2_shopify_sale_portion_settings sps
            JOIN re2_shopify_integrations si ON si.id = sps."shopifyIntegrationId"
            JOIN re2_integrations i ON i.id = si."integrationId"
            WHERE i."userId" = '${userId}')`,
        )
      }

      results.condition.andWhere(
        `"user_donation_payment"."reference_id" IN (
          ${referenceCondition.join(' UNION ALL ')}
        )`,
        {
          userId,
        },
      )
    }

    if (query?.date_filter?.start && query?.date_filter?.end) {
      results.condition.andWhere(`"data"."created" BETWEEN :start AND :end`, {
        start: query?.date_filter?.start,
        end: query?.date_filter?.end,
      })
    } else if (query?.date_filter?.start) {
      results.condition.andWhere(`"data"."created" >= :start`, {
        start: query?.date_filter?.start,
      })
    } else if (query?.date_filter?.end) {
      results.condition.andWhere(`"data"."created" <= :end`, {
        end: query?.date_filter?.end,
      })
    }

    results.condition.select([
      'data.id id',
      'data.reason reason',
      'data.is_recurring is_recurring',
      'data.amount net_amount',
      '(data.amount - data.system_fees) gross_amount',
      'data.created created',
      'data.system_fees system_fees',
      `CASE
        WHEN "data"."reason" IN ('${DonationType.FUNDRAISER_FORM}', '${DonationType.FUNDRAISER_PAGE}')
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
            AND i2."userId" = '${userId}'
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
            AND i2."userId" = '${userId}'
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
            AND i2."userId" = '${userId}'
          )
        END
      AS "source_details"`,
    ])

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        Id: item.id,
        Reason: item.reason,
        'Is Recurring': item.is_recurring,
        'Net Amount': item.net_amount,
        'Gross Amount': item.gross_amount,
        Created: item.created,
        'System Fees': item.system_fees,
        'Source Details': JSON.stringify(item.source_details),
      }))

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    results.condition.orderBy('"data"."created"', 'DESC')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
