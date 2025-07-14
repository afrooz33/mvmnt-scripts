import { PreconditionFailedException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/users/user/enums'

export default async function (userId: string) {
  const userBuilder: QueryBuilderDataInterface = new QueryBuilder({})
    .addFilter('id', userId)
    .addRelation(Query.PROFILE)
    .addRelation(Query.PROFILE_IMAGES)
    .addFilter('account_status', AccountStatus.ENABLED)
    .useQuery(this.userService.userRepository)
    .create()

  userBuilder.condition.select([
    'data.id',
    'data.username',
    'data.display_name',
    'data.account_type',
    'data.is_verified',
    'profile.id',
    'profile_images',
    'profile.social_accounts',
    'data.grade',
    'data.rank',
  ])

  const user = await userBuilder.condition.getOne()

  if (!user) {
    throw new PreconditionFailedException(ErrorKey.USER_NOT_FOUND)
  }

  return user
}
