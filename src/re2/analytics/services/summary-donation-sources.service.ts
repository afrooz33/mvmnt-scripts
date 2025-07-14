import { ExportToCsv } from 'export-to-csv'
import { NotFoundException } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { CheckNonprofitDonationQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DonationType } from '@app/src/donations/enums'
import { SourceFilter } from '@app/src/re2/analytics/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { Re2AnalyticQueryDto } from '@app/src/re2/analytics/dto'

function AddReceiverCondition(
  results: QueryBuilderDataInterface,
  id: string,
  receiver: 'nonprofit' | 'donation_project',
) {
  if (receiver === 'nonprofit') {
    results.condition.andWhere(`${CheckNonprofitDonationQuery('data', id, true)}`)
  } else {
    results.condition.andWhere(`"data"."donationProjectId" = '${id}'`)
  }
}

function AddSourceFilterCondition(results: QueryBuilderDataInterface, query: Re2AnalyticQueryDto) {
  if (!query?.source_filter) return

  const sourceConditions = {
    [SourceFilter.FORM]: `"data"."reason" = '${DonationType.FUNDRAISER_FORM}'`,
    [SourceFilter.PAGE]: `"data"."reason" = '${DonationType.FUNDRAISER_PAGE}'`,
    [SourceFilter.INTEGRATION]: `"data"."reason" IN (
      '${DonationType.INTEGRATION_CART_BANNER}',
      '${DonationType.INTEGRATION_CART_DRAWER}',
      '${DonationType.INTEGRATION_SALES_PORTION}'
    )`,
  }

  results.condition.andWhere(sourceConditions[query.source_filter])
}

function GetSourceDetailsSelect(userId: string) {
  return [
    'data.id',
    'data.reason',
    'data.amount',
    'data.system_fees',
    'data.status',
    'data.created',
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
  ]
}

export default async function (
  id: string,
  receiver: 'nonprofit' | 'donation_project',
  query: Re2AnalyticQueryDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('donation_project')
      .addRelation('user_donation_payment')
      .create()

    AddReceiverCondition(results, id, receiver)
    AddSourceFilterCondition(results, query)

    if (query?.date_filter?.start && query?.date_filter?.end) {
      results.condition.andWhere(`"data"."created" BETWEEN :start_date AND :end_date`, {
        start_date: query.date_filter.start,
        end_date: query.date_filter.end,
      })
    } else if (query?.date_filter?.start) {
      results.condition.andWhere(`"data"."created" >= :start_date`, {
        start_date: query.date_filter.start,
      })
    } else if (query?.date_filter?.end) {
      results.condition.andWhere(`"data"."created" <= :end_date`, {
        end_date: query.date_filter.end,
      })
    }

    results.condition.select(GetSourceDetailsSelect(userId))

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()
      if (!data.length) {
        throw new NotFoundException(ErrorKey.NO_CSV_DATA_FOUND)
      }

      const csvData = data.map((item) => ({
        Id: item.id,
        Reason: item.reason,
        Amount: item.amount,
        Status: item.status,
        'System Fees': item.system_fees,
        'Source Data': JSON.stringify(item.source_details),
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
