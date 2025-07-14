import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { GetDealFirstImageQuery, GetGrossDonationsQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { DealStatus } from '@app/src/users/deal/enums'
import { ManualDealFilterDto } from '@app/src/admin/homepages/dto'

export default async function (query: ManualDealFilterDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealRepository)
      .addRelation(Query.USER)
      .addRelation(`${Query.USER}.${Query.PROFILE}`)
      .addRelation(Query.DONATION_NONPROFIT)
      .addRelation(`${Query.DONATION_NONPROFIT}.${Query.PROFILE}`)
      .addRelation(Query.DONATION_PROJECT)
      .addRelation(Query.CATEGORY)
      .addRelation(Query.BRAND)
      .create()

    results.condition.select([
      'data.id id',
      'data.name name',
      'data.description description',
      'data.start_date start_date',
      'data.end_date end_date',
      'data.status status',
      'user.username username',
      'user.display_name display_name',
      'profile.social_accounts social_accounts',
      'data.current_bid',
      'data.participants',
      'data.total_donation',
      'data.net_donation',
      'donation_project.name donation_project_name',
      'profile_1.foundation_name foundation_name',
      'profile_1.foundation_url foundation_url',
      `${GetDealFirstImageQuery('"data"."deal_type"', '"data"."id"')}`,
    ])

    if (query.keyword) {
      // ToDo: add sns username search + filter based on sns follower
      results.condition.andWhere(
        '("data"."name" ILIKE :keyword OR "user"."username" ILIKE :keyword OR "profile"."introduction" ILIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      )
    }

    if (query.deal_type) {
      results.condition.andWhere(`"data"."deal_type" = :deal_type`, { deal_type: query.deal_type })
    }

    if (query.shipping_covered_by) {
      results.condition.andWhere(`"data"."shipping_covered_by" = :shipping_covered_by`, {
        shipping_covered_by: query.shipping_covered_by,
      })
    }

    if (query.status) {
      results.condition.andWhere(`"data"."status" = :deal_status`, { deal_status: query.status })
    } else {
      results.condition.andWhere(`"data"."status" IN (:...deal_status)`, {
        deal_status: [DealStatus.ENDED, DealStatus.ON_DEAL, DealStatus.SCHEDULED],
      })
    }

    if (query?.gross_donations?.start) {
      results.condition.andWhere(`(${GetGrossDonationsQuery('"data"')}) >= :donation_amount`, {
        donation_amount: query.gross_donations.start,
      })
    }

    if (query?.gross_donations?.end) {
      results.condition.andWhere(`(${GetGrossDonationsQuery('"data"')}) <= :donation_amount`, {
        donation_amount: query.gross_donations.end,
      })
    }

    if (query?.price?.start) {
      results.condition.andWhere(`"data"."starting_price" >= :starting_price`, {
        starting_price: query.price.start,
      })
    }

    if (query?.price?.end) {
      results.condition.andWhere(`"data"."starting_price" <= :starting_price`, {
        starting_price: query.price.end,
      })
    }

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
