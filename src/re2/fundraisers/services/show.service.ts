import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetRe2DonationQuery, GetNetOrGrossDonationField } from '@app/src/shared/sql'
import { QueryDto } from '@app/src/re2/fundraisers/dto'
import { DonationType } from '@app/src/donations/enums'
import { FundraiserStatus } from '@app/src/re2/fundraisers/enums'

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.fundraiserRepository)
      .addFilter('user', userId)
      .addRelation(Query.NONPROFIT)
      .addRelation(Query.NONPROFIT_PROFILE)
      .addRelation(Query.DONATION_PROJECTS)
      .create()

    results.condition.select([
      'data.id',
      'data.title',
      'data.public_url',
      'data.type',
      'data.status',
      'nonprofit.id',
      'profile.foundation_name',
      'data.description',
      'donation_projects.id',
      'donation_projects.name',
      'data.created',
    ])

    if (query.keyword) {
      results.condition.andWhere('data.title ILIKE :keyword', { keyword: `%${query.keyword}%` })
      results.condition.orWhere('data.public_url ILIKE :keyword', { keyword: `%${query.keyword}%` })
      results.condition.orWhere('donation_projects.name ILIKE :keyword', {
        keyword: `%${query.keyword}%`,
      })
      results.condition.orWhere('profile.foundation_name ILIKE :keyword', {
        keyword: `%${query.keyword}%`,
      })
    }

    if (query.nonprofit) {
      results.condition.andWhere(
        'data.id IN (SELECT "re2FundraisersId" FROM "re2_fundraisers_nonprofit_users" WHERE "nonprofitUsersId" = :nonprofit)',
        {
          nonprofit: query.nonprofit,
        },
      )
    }

    if (query?.filter?.status) {
      results.condition.andWhere('data.status = :status', { status: query.filter.status })
    } else {
      results.condition.andWhere('data.status NOT IN (:...status)', {
        status: [FundraiserStatus.DELETED, FundraiserStatus.PREVIEW],
      })
    }

    const grossDonation = `(${GetRe2DonationQuery({
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
    })})`

    if (query?.gross_donation?.start && query?.gross_donation?.end) {
      results.condition.andWhere(`${grossDonation} BETWEEN :start AND :end`, {
        start: query.gross_donation.start,
        end: query.gross_donation.end,
      })
    } else if (query?.gross_donation?.start) {
      results.condition.andWhere(`${grossDonation} >= :start`, {
        start: query.gross_donation.start,
      })
    } else if (query?.gross_donation?.end) {
      results.condition.andWhere(`${grossDonation} <= :end`, {
        end: query.gross_donation.end,
      })
    }

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
