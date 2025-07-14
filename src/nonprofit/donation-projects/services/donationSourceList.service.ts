import { In } from 'typeorm'
import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { BuildDateFilterCondition } from '@app/src/shared/sql/common.sql'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetDealQuantityQuery, GetTotalDealSalesQuery } from '@app/src/shared/sql'
import { DealType } from '@app/src/users/deal/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'
import { DonationType, DONATION_STATUS } from '@app/src/donations/enums'
import { DonationSourceListQueryDto } from '@app/src/nonprofit/donation-projects/dto'

export default async function (
  id: string,
  userId: string,
  query: DonationSourceListQueryDto,
  isExport: boolean,
): Promise<PaginateRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: { id: userId },
            status: In([Status.ENDED, Status.TO_BE_CANCELLED, Status.PUBLISHED]),
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
    })

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('donation_project', id)
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

    if (query.total_donation?.start && query.total_donation?.end) {
      results.condition.having(`SUM("data"."amount") BETWEEN :donStart AND :donEnd`, {
        donStart: query.total_donation.start,
        donEnd: query.total_donation.end,
      })
    } else if (query.total_donation?.start) {
      results.condition.having(`SUM("data"."amount") >= :donStart`, {
        donStart: query.total_donation.start,
      })
    } else if (query.total_donation?.end) {
      results.condition.having(`SUM("data"."amount") <= :donEnd`, {
        donEnd: query.total_donation.end,
      })
    }

    if (query?.keyword) {
      results.condition.andWhere(
        `(
          ("data"."reason" IN ('${DonationType.BUYNOW}','${DonationType.RAFFLE}','${DonationType.AUCTION}')
            AND "deal"."name" ILIKE :kw)
          OR (
            "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
            AND EXISTS (
              SELECT 1
              FROM "re2_shopify_cart_banner_settings" cb
                JOIN "re2_shopify_integrations" si ON cb."shopifyIntegrationId" = si."id"
                JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
                JOIN "re2_profiles" p ON i2."userId" = p."userId"
              WHERE cb."id" = "user_donation_payment"."reference_id"
                AND (
                  cb."name" ILIKE :kw
                  OR si."shop" ILIKE :kw
                  OR p."company_name" ILIKE :kw
                )
            )
          )
          OR (
            "data"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}'
            AND EXISTS (
              SELECT 1
              FROM "re2_shopify_cart_drawer_settings" cd
                JOIN "re2_shopify_integrations" si ON cd."shopifyIntegrationId" = si."id"
                JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
                JOIN "re2_profiles" p ON i2."userId" = p."userId"
              WHERE cd."id" = "user_donation_payment"."reference_id"
                AND (
                  cd."name" ILIKE :kw
                  OR si."shop" ILIKE :kw
                  OR p."company_name" ILIKE :kw
                )
            )
          )
          OR (
            "data"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}'
            AND EXISTS (
              SELECT 1
              FROM "re2_shopify_sale_portion_settings" sp
                JOIN "re2_shopify_integrations" si ON sp."shopifyIntegrationId" = si."id"
                JOIN "re2_integrations" i2 ON si."integrationId" = i2."id"
                JOIN "re2_profiles" p ON i2."userId" = p."userId"
              WHERE sp."id" = "user_donation_payment"."reference_id"
                AND (
                  sp."name" ILIKE :kw
                  OR si."shop" ILIKE :kw
                  OR p."company_name" ILIKE :kw
                )
            )
          )
          OR (
            "data"."reason" IN ('${DonationType.FUNDRAISER_FORM}','${DonationType.FUNDRAISER_PAGE}')
            AND EXISTS (
              SELECT 1
              FROM "re2_fundraisers" f
                JOIN "re2_users" uf ON uf."id" = f."userId"
                JOIN "re2_profiles" p ON p."userId" = uf."id"
              WHERE f."id" = "user_donation_payment"."reference_id"
                AND (
                  f."title" ILIKE :kw
                  OR f."public_url" ILIKE :kw
                  OR p."company_name" ILIKE :kw
                )
            )
          )
        )`,
        { kw: `%${query.keyword}%` },
      )
    }

    if (query?.donation_source_status) {
      const { donation_source_status } = query

      results.condition.andWhere(
        `(
          (
            "data"."reason" IN ('${DonationType.BUYNOW}', '${DonationType.RAFFLE}', '${DonationType.AUCTION}')
            AND "deal"."status" = :donation_source_status
          )
          OR (
            "data"."reason" IN ('${DonationType.FUNDRAISER_FORM}', '${DonationType.FUNDRAISER_PAGE}')
            AND EXISTS (
              SELECT 1
              FROM "re2_fundraisers" f
              WHERE f."id" = "user_donation_payment"."reference_id"
                AND f."status" = :donation_source_status
            )
          )
          OR (
            "data"."reason" = '${DonationType.INTEGRATION_CART_BANNER}'
            AND EXISTS (
              SELECT 1
              FROM "re2_shopify_cart_banner_settings" cb
              WHERE cb."id" = "user_donation_payment"."reference_id"
                AND cb."status" = :donation_source_status
            )
          )
          OR (
            "data"."reason" = '${DonationType.INTEGRATION_CART_DRAWER}'
            AND EXISTS (
              SELECT 1
              FROM "re2_shopify_cart_drawer_settings" cd
              WHERE cd."id" = "user_donation_payment"."reference_id"
                AND cd."status" = :donation_source_status
            )
          )
          OR (
            "data"."reason" = '${DonationType.INTEGRATION_SALES_PORTION}'
            AND EXISTS (
              SELECT 1
              FROM "re2_shopify_sale_portion_settings" sp
              WHERE sp."id" = "user_donation_payment"."reference_id"
                AND sp."status" = :donation_source_status
            )
          )
        )`,
        { donation_source_status },
      )
    }

    if (query?.donation_source_start_date) {
      const { sql, params } = BuildDateFilterCondition({
        dateType: 'start',
        range: query.donation_source_start_date,
        paramKeyPrefix: 'startDate',
      })

      if (sql) {
        results.condition.andWhere(sql, params)
      }
    }

    if (query?.donation_source_end_date) {
      const { sql, params } = BuildDateFilterCondition({
        dateType: 'end',
        range: query.donation_source_end_date,
        paramKeyPrefix: 'endDate',
      })

      if (sql) {
        results.condition.andWhere(sql, params)
      }
    }

    results.condition.orderBy({
      '"total_donation"': 'DESC',
    })

    if (isExport) {
      const data = await results.condition.getRawMany()

      if (!data.length) {
        return
      }

      const csvData = data.map((item) => {
        return {
          reason: item.reason,
          source_id: item.source_id,
          total_donation: item.total_donation,
          total_donors: item.total_donors,
          source_details: JSON.stringify(item.source_details),
        }
      })

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
