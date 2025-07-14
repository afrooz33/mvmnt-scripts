import { ILike } from 'typeorm'
import { ISearchQueryBuilder } from '@app/src/shared/interfaces'

export class SearchQueryBuilder implements ISearchQueryBuilder {
  private keyword: string
  private fields: any

  constructor() {
    this.keyword = ''
    this.fields = new Set()
  }

  public setKeyword(keyword: string): ISearchQueryBuilder {
    this.keyword = keyword

    return this
  }

  public setFields(fields: string[]): ISearchQueryBuilder {
    fields.forEach((field) => {
      field.split(',').forEach(this.fields.add.bind(this.fields))
    })

    return this
  }

  public create(): any[] {
    return [...this.fields].map((field) => ({
      [field]: ILike(`%${this.keyword.toLocaleLowerCase()}%`),
    }))
  }

  public createQuery(): any[] {
    if (!this.fields.size) {
      return []
    }

    const query = [...this.fields]
      .map((field) => {
        if (field.includes('.')) {
          const [relation, column] = field.split('.')

          return `"${relation}"."${column.trim()}" ILIKE :searchByKeywordPattern`
        }

        return `"data"."${field.trim()}" ILIKE :searchByKeywordPattern`
      })
      .join(' OR ')

    return [`(${query})`, { searchByKeywordPattern: `%${this.keyword.toLocaleLowerCase()}%` }]
  }
}
