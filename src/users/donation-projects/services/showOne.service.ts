import { NotFoundException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { TagStatus } from '@app/src/admin/tags/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

export default async function (id: string): Promise<any> {
  try {
    const status = [
      DonationProjectStatus.PUBLISHED,
      DonationProjectStatus.TO_BE_CANCELLED,
      DonationProjectStatus.ENDED,
    ]

    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .addRelation(Query.USER)
      .addRelation(Query.TAGS)
      .addRelation(Query.IMAGES)
      .addRelation(Query.USER_PROFILE)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .useQuery(this.donationProjectRepository)
      .create()

    results.condition.andWhere(`"data"."status" IN (:...status)`, {
      status,
    })

    results.condition.andWhere(`"data"."id" = :id`, { id })

    results.condition.andWhere(`"tags"."status" = :tag_status`, {
      tag_status: TagStatus.ACTIVE,
    })

    results.condition.select([
      'tags',
      'images',
      'data.id',
      'user.id',
      'data.name',
      'data.goal_amount',
      'data.is_goal_set',
      'profile.first_name',
      'profile.last_name',
      'profile_image.url',
      'data.description',
      'data.introduction',
      'data.total_donors',
      'data.deadline_date',
      'data.published_date',
      'data.gross_donations',
      'data.total_donations',
      'profile.foundation_url',
      'profile.foundation_name',
      'profile.social_accounts',
      'data.is_deadline_enabled',
    ])

    const donationProject = await results.condition.getOne()

    if (!donationProject) {
      throw new NotFoundException(ErrorKey.DONATION_PROJECT_NOT_FOUND)
    }

    return donationProject
  } catch (error) {
    return HandleErrors(error)
  }
}
