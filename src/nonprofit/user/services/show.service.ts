import { BadRequestException } from '@nestjs/common'
import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/nonprofit/user/dto'
import { AccountStatus } from '@app/src/nonprofit/user/enums'

export default async function (query: QueryDto): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .addFilter('account_status', AccountStatus.DELETED, true)
      .addRelation(Query.PROFILE)
      .addRelation(Query.PROFILE_TAGS)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .useQuery(this.nonprofitUserRepository)
      .create()

    results.condition.select([
      'data.id',
      'profile.first_name',
      'profile.last_name',
      'profile.foundation_name',
      'profile.foundation_url',
      'profile.introduction',
      'profile_image.url',
      'tags.id',
      'tags.name',
      'data.created',
    ])

    return await this.customPaginate(results)
  } catch (error) {
    throw new BadRequestException(error.message ?? error.toString())
  }
}
