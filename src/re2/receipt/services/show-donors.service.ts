import { ExportToCsv } from 'export-to-csv'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/re2/receipt/dto'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userDonationsRepository)
      .addRelation('user')
      .addRelation('user.profile')
      .addRelation('user_donation_payment')
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    const reference = []

    reference.push(
      `(SELECT "id" FROM "re2_fundraisers" WHERE "userId" = '${userId}' AND "type" = '${FundraiserType.FORM}')`,
    )

    reference.push(
      `(SELECT "id" FROM "re2_fundraisers" WHERE "userId" = '${userId}' AND "type" = '${FundraiserType.PAGE}')`,
    )

    reference.push(
      `(SELECT cbs.id 
        FROM re2_shopify_cart_banner_settings cbs
        JOIN re2_shopify_integrations si ON si.id = cbs."shopifyIntegrationId"
        JOIN re2_integrations i ON i.id = si."integrationId"
        WHERE i."userId" = '${userId}')`,
    )

    reference.push(
      `(SELECT cds.id 
        FROM re2_shopify_cart_drawer_settings cds
        JOIN re2_shopify_integrations si ON si.id = cds."shopifyIntegrationId"
        JOIN re2_integrations i ON i.id = si."integrationId"
        WHERE i."userId" = '${userId}')`,
    )

    reference.push(
      `(SELECT sps.id 
        FROM re2_shopify_sale_portion_settings sps
        JOIN re2_shopify_integrations si ON si.id = sps."shopifyIntegrationId"
        JOIN re2_integrations i ON i.id = si."integrationId"
        WHERE i."userId" = '${userId}')`,
    )

    results.condition.andWhere(
      `"user_donation_payment"."reference_id" IN (
        ${reference.join(' UNION ALL ')}
      )`,
    )

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

    if (query?.keyword) {
      results.condition.andWhere(
        `("user"."display_name" ILIKE :keyword OR "user"."username" ILIKE :keyword OR "user"."email" ILIKE :keyword)`,
        {
          keyword: `%${query?.keyword}%`,
        },
      )
    }

    if (query?.gross_donation?.start && query?.gross_donation?.end) {
      results.condition.andWhere(
        `("data"."amount" - "data"."system_fees") BETWEEN :start AND :end`,
        {
          start: query?.gross_donation?.start,
          end: query?.gross_donation?.end,
        },
      )
    } else if (query?.gross_donation?.start) {
      results.condition.andWhere(`("data"."amount" - "data"."system_fees") >= :start`, {
        start: query?.gross_donation?.start,
      })
    } else if (query?.gross_donation?.end) {
      results.condition.andWhere(`("data"."amount" - "data"."system_fees") <= :end`, {
        end: query?.gross_donation?.end,
      })
    }

    results.condition.select([
      'user.id user_id',
      'user.display_name user_display_name',
      'user.username user_username',
      'user.account_type user_account_type',
      'user.account_status user_account_status',
      'user.is_verified user_is_verified',
      'profile.social_accounts user_social_accounts',
      'user.email user_email',
      'COUNT(data.id) as total_donations',
      'SUM(data.amount) as total_net_donations',
      'SUM(data.amount - data.system_fees) as total_gross_donations',
    ])

    results.condition.groupBy(['user.id', 'profile.id'])

    if (query?.total_donation?.start && query?.total_donation?.end) {
      results.condition.having(`COUNT(data.id) BETWEEN :start AND :end`, {
        start: query?.total_donation?.start,
        end: query?.total_donation?.end,
      })
    } else if (query?.total_donation?.start) {
      results.condition.having(`COUNT(data.id) >= :start`, {
        start: query?.total_donation?.start,
      })
    } else if (query?.total_donation?.end) {
      results.condition.having(`COUNT(data.id) <= :end`, {
        end: query?.total_donation?.end,
      })
    }

    results.condition.orderBy('total_net_donations', 'DESC')

    if (query?.export === 'Yes') {
      const data = await results.condition.getRawMany()

      const csvData = data.map((item) => ({
        'User ID': item.user_id,
        'Display Name': item.user_display_name,
        Username: item.user_username,
        Email: item.user_email,
        'Total Donations': item.total_donations,
        'Total Net Donations': item.total_net_donations,
        'Total Gross Donations': item.total_gross_donations,
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
