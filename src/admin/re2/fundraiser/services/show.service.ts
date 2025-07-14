import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetRe2DonationQuery, GetNetOrGrossDonationField } from '@app/src/shared/sql/common.sql'
import { DonationType } from '@app/src/donations/enums'
import { QueryDto } from '@app/src/admin/re2/fundraiser/dto'
import { FundraiserStatus } from '@app/src/re2/fundraisers/enums'
import {
  GetNonprofitDataSql,
  GetDonationProjectDataSql,
} from '@app/src/admin/re2/fundraiser/helpers'

export default async function (query: QueryDto): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.fundraiserRepository)
      .create()

    if (query?.user) {
      results.condition.andWhere('"data"."userId" = :user', { user: query.user })
    }

    results.condition.andWhere('"data"."status" NOT IN (:...fundraiser_status)', {
      fundraiser_status: [FundraiserStatus.DELETED, FundraiserStatus.DRAFT],
    })

    results.condition.select([
      'data.id id',
      'data.type type',
      'data.title title',
      'data.status status',
      'data.created created',
      'data.end_date end_date',
      'data.start_date start_date',
      'data.public_url public_url',
      'data.description description',
      `(${GetRe2DonationQuery({
        re2Id: '"data"."userId"',
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        isAll: true,
      })}) gross_donations`,
      `(${GetRe2DonationQuery({
        re2Id: '"data"."userId"',
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
        isAll: true,
      })}) net_donations`,
      `(${GetRe2DonationQuery({
        re2Id: '"data"."userId"',
        donationType: [DonationType.FUNDRAISER_FORM, DonationType.FUNDRAISER_PAGE],
        select: `COUNT(DISTINCT "donation"."userId")`,
        isAll: true,
      })}) total_contributors`,
      `(${GetNonprofitDataSql(
        're2_fundraisers_nonprofit_users',
        '"data"."id" = "nonprofit"."re2FundraisersId"',
      )}) nonprofits`,
      `(${GetDonationProjectDataSql(
        're2_fundraisers_donation_projects',
        '"data"."id" = "donation_project"."re2FundraisersId"',
      )}) donation_projects`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
