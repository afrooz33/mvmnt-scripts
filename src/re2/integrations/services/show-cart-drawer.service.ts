import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetRe2DonationQuery, GetNetOrGrossDonationField } from '@app/src/shared/sql/common.sql'
import { DonationType } from '@app/src/donations/enums'
import { QueryCartDrawerDto } from '@app/src/re2/integrations/dto'

export default async function showCartDrawerService(
  query: QueryCartDrawerDto,
  userId: string,
): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation(Query.NONPROFITS)
      .addRelation(`${Query.NONPROFITS}.${Query.PROFILE}`)
      .addRelation(Query.DONATION_PROJECTS)
      .addRelation(Query.SHOPIFY_INTEGRATION)
      .addRelation(Query.SHOPIFY_INTEGRATION_INTEGRATION)
      .useQuery(this.shopifyCartDrawerSettingRepository)
      .create()

    results.condition.select([
      '"data"."id"',
      '"data"."name"',
      '"data"."status"',
      '"data"."created"',
      `COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', "nonprofits"."id",
              'profile', json_build_object(
                'first_name', "profile"."first_name",
                'last_name', "profile"."last_name",
                'foundation_name', "profile"."foundation_name",
                'foundation_url', "profile"."foundation_url"
              )
            )
          ) FILTER (WHERE "nonprofits"."id" IS NOT NULL)
        ),
        '[]'::json
      ) as "nonprofits"`,
      `COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', "donation_projects"."id",
              'name', "donation_projects"."name"
            )
          ) FILTER (WHERE "donation_projects"."id" IS NOT NULL)
        ),
        '[]'::json
      ) as "donation_projects"`,
      `(${GetRe2DonationQuery({
        re2Id: userId,
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        isAll: true,
      })}) as "gross_donation"`,
      `(${GetRe2DonationQuery({
        re2Id: userId,
        donationType: [
          DonationType.FUNDRAISER_FORM,
          DonationType.FUNDRAISER_PAGE,
          DonationType.INTEGRATION_CART_BANNER,
          DonationType.INTEGRATION_CART_DRAWER,
          DonationType.INTEGRATION_SALES_PORTION,
        ],
        select: `COALESCE(SUM(${GetNetOrGrossDonationField('donation', false)}), 0)::float`,
        isAll: true,
      })}) as "net_donation"`,
    ])

    results.condition.andWhere('integration.userId = :userId', { userId })

    results.condition.groupBy('"data"."id"')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
