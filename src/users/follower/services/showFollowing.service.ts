import { PaginateRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'

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
      .addRelation(Query.FOLLOWING)
      .addRelation(`${Query.FOLLOWING}.${Query.PROFILE}`)
      .addRelation(Query.PROFILE_IMAGES)
      .create()

    results.condition.andWhere('"data"."followerId" = :followerId', { followerId: user.id })
    results.condition.andWhere('"following"."account_status" = :account_status', {
      account_status: AccountStatus.ENABLED,
    })

    results.condition.select([
      'data.id id',
      'following.id following_id',
      'following.username following_username',
      'following.display_name following_display_name',
      'profile.id following_profile_id',
      'profile_images.url following_profile_image',
    ])

    return await this.rawPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
