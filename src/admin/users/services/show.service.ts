import { ExportToCsv } from 'export-to-csv'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import {
  GetDealDonationQuery,
  GetUserDealSalesQuery,
  GetTotalDealSalesQuery,
  GetUserContrinutionQuery,
  GetNetOrGrossDonationField,
} from '@app/src/shared/sql'
import { QueryDto } from '@app/src/admin/users/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

export default async function (query: QueryDto, isExport: boolean = false): Promise<UserEntity> {
  // ToDo - filter with follower, because we are not able to get follower list from SNS API

  // if (query.follower && !query.social_account) {
  //   throw new BadRequestException('Please provide social accounts')
  // }

  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.userRepository)
      .create()

    if (query?.social_account) {
      query.social_account.map((sns) => {
        results.condition.andWhere(`"profile"."social_accounts"::jsonb->'${sns}' IS NOT NULL`)
      })
    }

    const gross_donation_query = `(${GetDealDonationQuery({
      select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
      columnMatchCondition: `"donation"."userId" = "data"."id"`,
    })})`

    if (query?.gross_donation?.start) {
      results.condition.andWhere(`${gross_donation_query} >= ${query.gross_donation.start}`)
    }

    if (query?.gross_donation?.end) {
      results.condition.andWhere(`${gross_donation_query} <= ${query.gross_donation.end}`)
    }

    if (query?.last_login?.start) {
      results.condition.andWhere(`"data"."last_login" >= '${query.last_login.start}'`)
    }

    if (query?.last_login?.end) {
      results.condition.andWhere(`"data"."last_login" <= '${query.last_login.end}'`)
    }

    if (query?.past_spent?.start) {
      results.condition.andWhere(
        `(${GetTotalDealSalesQuery({
          select: 'COALESCE(SUM("payment"."deal_amount"), 0)',
          userId: '"data"."id"',
        })}) >= ${query.past_spent.start}`,
      )
    }

    if (query?.past_spent?.end) {
      results.condition.andWhere(
        `(${GetTotalDealSalesQuery({
          select: 'COALESCE(SUM("payment"."deal_amount"), 0)',
          userId: '"data"."id"',
        })}) <= ${query.past_spent.end}`,
      )
    }

    if (query?.total_sales?.start) {
      results.condition.andWhere(
        `(${GetUserDealSalesQuery({
          userId: `"data"."id"`,
          select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
        })}) >= :total_sales_end`,
        {
          total_sales_end: query.total_sales.start,
        },
      )
    }

    if (query?.total_sales?.end) {
      results.condition.andWhere(
        `(${GetUserDealSalesQuery({
          userId: `"data"."id"`,
          select: 'COALESCE(SUM("item_payment"."deal_amount"), 0)',
        })}) <= :total_sales_end`,
        {
          total_sales_end: query.total_sales.end,
        },
      )
    }

    if (query?.contribution_amount?.start) {
      results.condition.andWhere(`${GetUserContrinutionQuery()} >= :contribution_amount_start`, {
        contribution_amount_start: query.contribution_amount.start,
      })
    }

    if (query?.contribution_amount?.end) {
      results.condition.andWhere(`${GetUserContrinutionQuery()} <= :contribution_amount_end`, {
        contribution_amount_end: query.contribution_amount.end,
      })
    }

    if (query?.last_shopping_date?.leading_date) {
      results.condition.andWhere(
        `(${GetUserDealSalesQuery({
          userId: `"data"."id"`,
          select: 'MAX("item_payment"."created") as "updated"',
        })}) >= :lead_shopping_date`,
        {
          lead_shopping_date: query.last_shopping_date.leading_date,
        },
      )
    }

    if (query?.last_shopping_date?.trailing_date) {
      results.condition.andWhere(
        `(${GetUserDealSalesQuery({
          userId: `"data"."id"`,
          select: 'MAX("item_payment"."created") as "updated"',
        })}) <= :trail_shopping_date`,
        {
          trail_shopping_date: query.last_shopping_date.trailing_date,
        },
      )
    }

    if (query?.account_type && query.account_type.length) {
      const validAccountTypes = query.account_type.filter((type) => type !== null && type !== '')

      if (validAccountTypes.length > 0) {
        results.condition.andWhere(`"data"."account_type" IN (:...account_type)`, {
          account_type: validAccountTypes,
        })
      }
    }

    if (query?.account_status && query.account_status.length) {
      results.condition.andWhere(`"data"."account_status" IN (:...account_status)`, {
        account_status: query.account_status,
      })
    } else {
      results.condition.andWhere(`"data"."account_status" != '${AccountStatus.DELETED}'`)
    }

    results.condition.select([
      'data.id',
      'data.email',
      'data.account_type',
      'data.account_status',
      'data.display_name',
      'data.username',
      'data.brand_url',
      'data.gross_donations',
      'data.total_donations',
      'data.last_login',
      'data.created',
      'data.blocked_details',
      'profile',
      'profile_images',
    ])

    if (isExport) {
      const data = await results.condition.getMany()

      const csvData = data.map((item) => {
        return {
          id: item.id,
          email: item.email,
          account_type: item.account_type,
          account_status: item.account_status,
          display_name: item.display_name,
          username: item.username,
          brand_url: item.brand_url,
          gross_donations: item.gross_donations,
          total_donations: item.total_donations,
          last_login: item.last_login,
          created: item.created,
        }
      })

      const csvExporter = new ExportToCsv({
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
      })

      return csvExporter.generateCsv(csvData, true)
    }

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
