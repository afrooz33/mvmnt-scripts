import { paginate, Pagination, IPaginationOptions, paginateRaw } from 'nestjs-typeorm-paginate'
import { IPaginationBuilder } from '@app/src/shared/interfaces'
import { PaginateRO } from '@app/src/shared/dto'

export class PaginationBuilder implements IPaginationBuilder {
  private options: IPaginationOptions
  private condition: any
  private isQueryType: boolean

  constructor(
    private readonly repository: any,
    private readonly isRaw = false,
  ) {
    this.options = {
      page: 1,
      limit: 10,
    }
    this.condition = {}
    this.isQueryType = false
  }

  public setOption(options: IPaginationOptions): IPaginationBuilder {
    this.options = options

    return this
  }

  public setCondition(condition: any): IPaginationBuilder {
    this.condition = condition

    return this
  }

  public setType(isQueryType: boolean): IPaginationBuilder {
    this.isQueryType = isQueryType

    return this
  }

  public async create(cb?: any): Promise<PaginateRO> {
    const result: any = await this.paginate(this.isRaw)

    if (cb) {
      result.items = cb(result.items)
    }

    return this.toResponseObject(result)
  }

  private toResponseObject({ items, meta, links }: any): PaginateRO {
    return {
      data: items,
      meta: {
        next_page: links?.next,
        limit: meta.itemsPerPage,
        prev_page: links?.previous,
        total_page: meta.totalPages,
        current_page: meta.currentPage,
        total_record: meta.totalItems,
      },
    }
  }

  private async paginate(isRaw): Promise<Pagination<any>> {
    if (this.isQueryType && isRaw) {
      return paginateRaw<any>(this.condition, this.options)
    }

    if (this.isQueryType) {
      return paginate<any>(this.condition, this.options)
    }

    return paginate<any>(this.repository, this.options, this.condition)
  }
}
