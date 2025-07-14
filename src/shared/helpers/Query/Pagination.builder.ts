import { IPaginationQueryBuilder } from '@app/src/shared/interfaces'

export class PaginationQueryBuilder implements IPaginationQueryBuilder {
  private page: number
  private limit: number

  constructor() {
    this.page = 1
    this.limit = 10
  }

  public setPage(page: string): IPaginationQueryBuilder {
    const rightPage = parseInt(page, 10)

    if (rightPage && rightPage > 0) {
      this.page = rightPage
    }

    return this
  }

  public setLimit(limit: string): IPaginationQueryBuilder {
    const rightLimit = parseInt(limit, 10)

    if (rightLimit && rightLimit > 0) {
      this.limit = rightLimit
    }

    return this
  }

  public create(): any {
    return {
      page: this.page,
      limit: this.limit,
    }
  }
}
