import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetUserDonationProjectDonationQuery } from '@app/src/shared/sql/common.sql'
import { DateFilterQueryDto } from '@app/src/nonprofit/analytics/dto'
import { DONATION_STATUS, DonationType } from '@app/src/donations/enums'

export default async function (query: DateFilterQueryDto, userId: string): Promise<SuccessRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.donationsRepository)
      .create()

    results.condition.andWhere(
      `"data"."status" IN ('${DONATION_STATUS.COMPLETED}', '${DONATION_STATUS.SETTLED}')`,
    )

    results.condition.select(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_donation',
    )
    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT(DISTINCT "donation"."userId"), 0)::int',
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_donor',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        reason: [DonationType.AUCTION],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_auction_donor',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT(DISTINCT "donation"."userId"), 0)::int',
        reason: [DonationType.RAFFLE],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_raffle_donor',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT(DISTINCT "donation"."userId"), 0)::int',
        reason: [DonationType.BUYNOW],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_buynow_donor',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        nonprofitId: userId,
        select: 'COALESCE(COUNT(DISTINCT "donation"."userId"), 0)::int',
        isDirect: true,
        reason: [DonationType.DIRECT_DONATION],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_direct_donor',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        reason: [DonationType.AUCTION],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_auction_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        reason: [DonationType.RAFFLE],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_raffle_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        reason: [DonationType.BUYNOW],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_buynow_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        isDirect: true,
        reason: [DonationType.DIRECT_DONATION],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_direct_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        reason: [DonationType.FUNDRAISER_FORM],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_fundraiser_form_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT("donation"."id"), 0)::int',
        reason: [DonationType.FUNDRAISER_FORM],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_fundraiser_form_donation_count',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(SUM("donation"."amount"), 0)::float',
        reason: [DonationType.FUNDRAISER_PAGE],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_fundraiser_page_donation',
    )

    results.condition.addSelect(
      `(${GetUserDonationProjectDonationQuery({
        isNonprofit: true,
        userId,
        select: 'COALESCE(COUNT("donation"."id"), 0)::int',
        reason: [DonationType.FUNDRAISER_PAGE],
        query: {
          date_filter: {
            start: query?.date_filter?.start,
            end: query?.date_filter?.end,
          },
        },
      })})`,
      'total_fundraiser_page_donation_count',
    )

    return {
      success: true,
      data: await results.condition.getRawOne(),
      message: '',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
