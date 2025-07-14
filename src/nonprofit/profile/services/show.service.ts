import { ProfileRO, QueryDto } from '@app/src/nonprofit/profile/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'

export default async function (query: QueryDto, userId: string): Promise<ProfileRO> {
  try {
    const result: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.profileRepository)
      .addFilter('user', userId)
      .create()

    const profile: NonprofitProfileEntity = await result.condition.getOne()

    return profile.toResponseObject()
  } catch (error) {
    return HandleErrors(error)
  }
}
