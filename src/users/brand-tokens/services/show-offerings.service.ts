import { MyPaginateDto } from '@app/src/shared/base'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'

export async function showOfferingsService(
  brandId: string,
  query: MyPaginateDto = {},
): Promise<PaginateRO> {
  try {
    const results = new QueryBuilder(query).useQuery(this.offeringRepository).create()

    results.condition
      .where('data.brand_token.id = :brandId', { brandId })
      .leftJoinAndSelect('data.brand_token', 'brand_token')
      .leftJoinAndSelect('brand_token.brand', 'brand')
      .orderBy('data.created', 'DESC')

    return await this.paginate(results)
  } catch (error) {
    return HandleErrors(error)
  }
}
