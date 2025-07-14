import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'
import { FollowType } from '@app/src/users/follower/enums'

export default async function (userId: string): Promise<PaginateRO> {
  try {
    const user = await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id'],
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .useQuery(this.followerRepository)
      .addRelation(Query.FOLLOWER)
      .addRelation(`${Query.FOLLOWER}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere('"data"."followingId" = :followingId', { followingId: user.id })
    results.condition.andWhere('"data"."type" = :type', { type: FollowType.PROFILE })
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
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
