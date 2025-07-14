import { IFilterQueryBuilder } from '@app/src/shared/interfaces'

export class FilterQueryBuilder implements IFilterQueryBuilder {
  private filters: any

  constructor(private readonly filter?: any) {
    this.filters = filter || {}
  }

  public add(key: string, value: unknown, deny: unknown): IFilterQueryBuilder {
    this.filters[key] = deny ? { value, deny } : value

    return this
  }

  public create(): any {
    return this.filters
  }

  public createQuery(): any[] {
    return Object.entries(this.filters)
  }
}
