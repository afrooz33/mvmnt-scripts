import { Query } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/re2/user/enums'
import { DonationType } from '@app/src/donations/enums'
import {
  GetRe2DonationQuery,
  GetTotalFundraisersQuery,
  GetTotalIntegrationsQuery,
  GetNetOrGrossDonationField,
} from '@app/src/shared/sql'

export default async function (id: string): Promise<SuccessRO> {
  try {
    const result: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.re2UserRepository)
      .addFilter('id', id)
      .addRelation(Query.PROFILE)
      .addFilter('account_status', AccountStatus.DELETED, true)
      .create()

    result.condition.select([
      'data.id id',
      'data.email email',
      'data.account_status account_status',
      'data.last_login last_login',
      'data.created registered_date',
      'profile.id profile_id',
      'profile.first_name first_name',
      'profile.last_name last_name',
      'profile.company_name company_name',
      'data.admin_memo admin_memo',
      `(${GetRe2DonationQuery({
        id,
        isAll: true,
        re2Id: id,
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
      })}) AS "gross_donation"`,
      `(${GetRe2DonationQuery({
        id,
        isAll: true,
        re2Id: id,
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
      })}) AS "net_donation"`,
      `${GetTotalFundraisersQuery()} AS "total_fundraisers"`,
      `${GetTotalIntegrationsQuery()} AS "total_integrations"`,
    ])

    return await result.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
