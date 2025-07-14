import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GetUserDonationQuery } from '@app/src/shared/sql'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export default async function (id: string): Promise<any> {
  try {
    const user: QueryBuilderDataInterface = new QueryBuilder({ filter: { id } })
      .useQuery(this.userRepository)
      .addRelation(Query.PROFILE)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    user.condition.andWhere('data.account_status NOT IN (:...account_status)', {
      account_status: [AccountStatus.DELETED, AccountStatus.UNDER_REVIEW],
    })

    if (!user) {
      throw new BadRequestException(ErrorKey.USER_NOT_FOUND)
    }

    user.condition.select([
      'data.id as id',
      'data.follower_count',
      'data.following_count',
      'profile.id as profile_id',
      'data.account_type as account_type',
      'data.display_name as display_name',
      'data.is_verified as is_verified',
      'profile_images.url as profile_image',
      'profile.introduction as introduction',
      'data.account_status as account_status',
      'profile.social_accounts as social_accounts',
      'profile.verification_status as verification_status',
      `(${GetUserDonationQuery({
        userId: id,
        isContribution: true,
      })}) AS "total_contribution"`,
      `CASE WHEN "data"."nonprofitId" IS NOT NULL THEN true ELSE false END AS "is_nonprofit"`,
    ])

    return await user.condition.getRawOne()
  } catch (error) {
    return HandleErrors(error)
  }
}
