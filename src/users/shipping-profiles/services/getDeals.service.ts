import { Query } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { QueryDto } from '@app/src/users/shipping-profiles/dto'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

/**
 * Retrieves deals associated with a user, filtering out deleted deals and including only BUYNOW and AUCTION types.
 * Each deal will be grouped by deal ID and variants will be aggregated into an array of properties.
 *
 * @param {QueryDto} query - The query parameters for pagination and filtering.
 * @param {string} userId - The ID of the user whose deals are to be retrieved.
 * @return {Promise<PaginateRO>} An object containing paginated deal records and associated metadata.
 */
export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const results: QueryBuilderDataInterface = new QueryBuilder(query)
      .useQuery(this.dealService.dealRepository)
      .addRelation(Query.IMAGES)
      .addFilter('user', userId)
      .create()

    if (query?.status) {
      results.condition.andWhere('"data"."status" IN (:...status)', {
        status: query.status,
      })
    } else {
      results.condition.andWhere('"data"."status" NOT IN (:...deal_status)', {
        deal_status: [DealStatus.DELETED],
      })
    }

    results.condition.andWhere('"data"."deal_type" IN (:...deal_type)', {
      deal_type: [DealType.BUYNOW],
    })

    results.condition.select(['data.id', 'data.name', 'data.deal_type', 'images', 'data.created'])

    results.condition.leftJoinAndSelect('data.variants', 'variants')
    results.condition.leftJoinAndSelect('variants.images', 'variants_images')
    results.condition.leftJoinAndSelect('variants.option_values', 'option_values')
    results.condition.leftJoinAndSelect('option_values.option', 'option')

    results.condition.addSelect(['option', 'variants', 'variants_images', 'option_values'])

    return await this.customPaginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
