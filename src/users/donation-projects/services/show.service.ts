import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { GetDonationProjectDonationQuery, GetNetOrGrossDonationField } from '@app/src/shared/sql'
import { QueryDto } from '@app/src/users/donation-projects/dto'
import { ProjectStatus } from '@app/src/users/donation-projects/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export default async function (query: QueryDto): Promise<PaginateRO> {
  try {
    let status = [
      DonationProjectStatus.ENDED,
      DonationProjectStatus.PUBLISHED,
      DonationProjectStatus.TO_BE_CANCELLED,
    ]

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addRelation(Query.USER)
      .addRelation(Query.TAGS)
      .addRelation(Query.USER_PROFILE)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .useQuery(this.donationProjectRepository)
      .create()

    if (query?.donation?.start) {
      results.condition.andWhere(
        `(${GetDonationProjectDonationQuery(
          'data',
          `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        )}) >= :gross_donation_start`,
        {
          gross_donation_start: query.donation.start,
        },
      )
    }

    if (query?.donation?.end) {
      results.condition.andWhere(
        `(${GetDonationProjectDonationQuery(
          'data',
          `COALESCE(SUM(${GetNetOrGrossDonationField('donation', true)}), 0)::float`,
        )}) <= :gross_donation_end`,
        {
          gross_donation_end: query.donation.end,
        },
      )
    }

    if (query?.status === ProjectStatus.ONGOING) {
      status = [DonationProjectStatus.PUBLISHED, DonationProjectStatus.TO_BE_CANCELLED]
    } else if (query?.status === ProjectStatus.CLOSED) {
      status = [DonationProjectStatus.ENDED]
    }

    results.condition.andWhere(`"data"."status" IN (:...status)`, {
      status,
    })

    results.condition.leftJoinAndSelect('data.images', 'donation_project_images')
    results.condition.andWhere(`"donation_project_images"."is_featured" = true`)

    results.condition.select([
      'data.id',
      'user.id',
      'data.name',
      'data.introduction',
      'data.description',
      'data.gross_donations',
      'data.total_donations',
      'data.total_deal_donations',
      'data.total_donors',
      'profile.first_name',
      'profile.last_name',
      'profile_image.url',
      'profile.foundation_url',
      'profile.foundation_name',
      'profile.social_accounts',
      'donation_project_images',
      'data.created',
      'tags.id',
      'tags.name',
    ])

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
