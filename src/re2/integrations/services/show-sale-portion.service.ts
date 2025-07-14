import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetNetOrGrossDonationField, GetRe2DonationQuery } from '@app/src/shared/sql'
import { DonationType } from '@app/src/donations/enums'
import { QuerySalePortionDto } from '@app/src/re2/integrations/dto'

export default async function (query: QuerySalePortionDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation(Query.NONPROFIT)
      .addRelation(`${Query.NONPROFIT}.${Query.PROFILE}`)
      .addRelation(Query.DONATION_PROJECT)
      .addRelation(Query.SHOPIFY_INTEGRATION)
      .addRelation(Query.SHOPIFY_INTEGRATION_INTEGRATION)
      .useQuery(this.shopifySalePortionSettingRepository)
      .create()

    results.condition.select([
      '"data"."id"',
      '"data"."name"',
      '"data"."donation_type"',
      '"data"."donation_value"',
      '"data"."status"',
      '"data"."created"',
      `COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', "nonprofit"."id",
              'profile', json_build_object(
                'first_name', "profile"."first_name",
                'last_name', "profile"."last_name",
                'foundation_name', "profile"."foundation_name",
                'foundation_url', "profile"."foundation_url"
              )
            )
          ) FILTER (WHERE "nonprofit"."id" IS NOT NULL)
        ),
        '[]'::json
      ) as "nonprofits"`,
      `COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', "donation_project"."id",
              'name', "donation_project"."name"
            )
          ) FILTER (WHERE "donation_project"."id" IS NOT NULL)
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

    results.condition.andWhere('"integration"."userId" = :userId', { userId })

    results.condition.groupBy('"data"."id"')

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
