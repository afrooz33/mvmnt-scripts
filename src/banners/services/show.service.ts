import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryDto } from '@app/src/banners/dto'
import { BannerStatus } from '@app/src/admin/banners/enums'
import { Query } from '@app/src/shared/enums'

export default async function (query: QueryDto) {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.bannerRepository)
      .addFilter('status', BannerStatus.ENABLED)
      .addRelation(Query.IMAGE_PC)
      .addRelation(Query.IMAGE_SP)
      .create()

    if (query?.section) {
      results.condition.andWhere('"data"."section" = :section', {
        section: query.section,
      })
    }

    results.condition.orderBy('"data"."display_order"', 'ASC')

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
