import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Query } from '@app/src/shared/enums'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { AccountStatus } from '@app/src/nonprofit/user/enums'

export default async function (id: string): Promise<any> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder({})
      .addFilter('id', id)
      .addFilter('account_status', AccountStatus.DELETED, true)
      .addRelation(Query.PROFILE)
      .addRelation(Query.NONPROFIT_PROFILE_IMAGE)
      .addRelation(`${Query.PROFILE}.${Query.TAGS}`)
      .useQuery(this.nonprofitUserRepository)
      .create()

    results.condition.select([
      'data.id',
      'data.email',
      'profile',
      'data.total_donations',
      'data.total_donors',
      'data.created',
      'profile_image',
      'tags',
    ])

    const user = await results.condition.getOne()

    if (!user) {
      throw new NotFoundException('Invalid nonprofit user')
    }

    return user.toResponseObject()
  } catch (error) {
    throw new BadRequestException(error.message ?? error.toString())
  }
}
