import { IsNull } from 'typeorm'
import { paginate } from 'nestjs-typeorm-paginate'
import { PaginateRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ListCategoryQueryDto } from '@app/src/admin/coupons/dto'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'

export default async function (query: ListCategoryQueryDto): Promise<PaginateRO> {
  try {
    const relations = ['children', 'children.children', 'translations']
    let conditions: any = {
      parent: IsNull(),
    }

    if (query.keyword) {
      conditions = [
        {
          parent: IsNull(),
          name: query.keyword,
        },
        {
          translations: {
            name: query.keyword,
          },
        },
      ]
    }

    const { items: records, meta } = await paginate<DealCategoryEntity>(
      this.dealCategoryRepository,
      { page: query.page, limit: query.limit },
      {
        relations,
        where: conditions,
      },
    )

    return {
      data: records,
      meta: {
        total_page: meta.totalPages,
        current_page: meta.currentPage,
        limit: meta.itemsPerPage,
        next_page: '',
        prev_page: '',
      },
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
