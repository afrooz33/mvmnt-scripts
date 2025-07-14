import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { FollowType } from '@app/src/users/follower/enums'
import { QueryFollowDto } from '@app/src/users/activity-reports/dto'

export default async function (query: QueryFollowDto, userId: string): Promise<PaginateRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          relations: [Query.NONPROFIT],
          select: ['id', 'nonprofit.id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    if (!user.nonprofit) {
      return
    }

    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.followersRepository)
      .addRelation(Query.FOLLOWER)
      .addRelation(`${Query.FOLLOWER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .addRelation(`${Query.FOLLOWER}.${Query.NONPROFIT}`)
      .addRelation(`${Query.NONPROFIT}.${Query.PROFILE}`)
      .create()

    results.condition.andWhere('"data"."followingId" = :followingId', { followingId: user.id })
    results.condition.andWhere('"data"."type" = :type', { type: FollowType.NONPROFIT })
    results.condition.andWhere('"follower"."account_status" = :account_status', {
      account_status: AccountStatus.ENABLED,
    })

    results.condition.select([
      'data.id id',
      'follower.id follower_id',
      'follower.username follower_username',
      'follower.display_name follower_display_name',
      'profile.id follower_profile_id',
      'profile_images.url follower_profile_image',
      'nonprofit.id nonprofit_id',
      'profile_1.first_name nonprofit_first_name',
      'profile_1.last_name nonprofit_last_name',
      'profile_1.foundation_name nonprofit_foundation_name',
      `(SELECT "images"."url" FROM "images" WHERE "images"."id" = "profile_1"."profileImageId" LIMIT 1) as "nonprofit_profile_image"`,
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
