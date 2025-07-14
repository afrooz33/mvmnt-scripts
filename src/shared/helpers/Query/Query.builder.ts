import {
  IFilterQueryBuilder,
  IOrderQueryBuilder,
  IPaginationQueryBuilder,
  IQueryBuilder,
  IRelationIdsInQueryBuilder,
  IRelationQueryBuilder,
  ISearchQueryBuilder,
  QueryBuilderDataInterface,
} from '@app/src/shared/interfaces'
import { FilterQueryBuilder } from './Filter.builder'
import { OrderQueryBuilder } from './Order.builder'
import { PaginationQueryBuilder } from './Pagination.builder'
import { RelationQueryBuilder } from './Relation.builder'
import { SearchQueryBuilder } from './Search.builder'
import { RelationIdsInQueryBuilder } from './RelationIdsIn.builder'

export class QueryBuilder implements IQueryBuilder {
  private queryBuilder: any

  private order: IOrderQueryBuilder
  private relations: IRelationQueryBuilder
  private pagination: IPaginationQueryBuilder
  private filter: IFilterQueryBuilder
  private search: ISearchQueryBuilder
  private relationsIdsIn: IRelationIdsInQueryBuilder

  constructor(private readonly query: any) {
    this.queryBuilder = null

    this.order = new OrderQueryBuilder()
    this.relations = new RelationQueryBuilder(query.includes)
    this.pagination = new PaginationQueryBuilder()
    this.filter = new FilterQueryBuilder(query.filter)
    this.search = new SearchQueryBuilder()
    this.relationsIdsIn = new RelationIdsInQueryBuilder(query.includeIds)
  }

  private get where(): string {
    return this.queryBuilder.expressionMap.wheres.length ? 'andWhere' : 'where'
  }

  private get isQueryType(): boolean {
    return !!this.queryBuilder
  }

  public useQuery(repository: any): IQueryBuilder {
    this.queryBuilder = repository.createQueryBuilder('data')

    return this
  }

  public addRelation(relation: string): IQueryBuilder {
    this.relations.add(relation)

    return this
  }

  public addFilter(key: string, value: any, deny = false): IQueryBuilder {
    if (!value) {
      return this
    }

    this.filter.add(key, value, deny)

    return this
  }

  public create(): QueryBuilderDataInterface {
    const page = Number.parseInt(this.query.page)
    const limit = Number.parseInt(this.query.limit)

    if (!isNaN(page) && page > 0) {
      this.pagination.setPage(this.query.page)
    } else {
      this.pagination.setPage('1')
    }

    if (!isNaN(limit) && limit > 0) {
      this.pagination.setLimit(this.query.limit)
    } else {
      this.pagination.setLimit('10')
    }

    if (this.query.order_by || this.query.order_direction) {
      this.order.setBy(this.query.order_by).setDirection(this.query.order_direction)
    }

    if (this.query.keyword && Array.isArray(this.query.search_fields)) {
      this.search.setKeyword(this.query.keyword).setFields(this.query.search_fields)
    }

    if (this.query.start_date) {
      const fieldKey = Object.keys(this.query.start_date)[0]

      if (fieldKey && this.query.start_date[fieldKey]) {
        this.filter.add(fieldKey, this.query.start_date, 'DATE_RANGE')
      }
    }

    if (this.query.end_date) {
      const fieldKey = Object.keys(this.query.end_date)[0]

      if (fieldKey && this.query.end_date[fieldKey]) {
        this.filter.add(fieldKey, this.query.end_date, 'DATE_RANGE')
      }
    }

    return {
      pagination: this.pagination.create(),
      condition: this.isQueryType ? this.createQuery() : this.createObject(),
      isQueryType: this.isQueryType,
    }
  }

  private createObject(): any {
    let search: any[] = this.search.create()
    const filter: any = this.filter.create()

    if (search.length) {
      search = search.map((item) => ({ ...item, ...filter }))
    }

    return {
      order: this.order.create(),
      relations: this.relations.create(),
      where: search.length ? search : filter,
    }
  }

  private createQuery(): any {
    const search: any[] = this.search.createQuery()
    const filter: any[] = this.filter.createQuery()
    const includeIds: any[] = this.relationsIdsIn.createQuery()

    this.relations
      .createQuery()
      .forEach((relation) => this.queryBuilder.leftJoinAndSelect(...relation))

    /**
     * If the filter value is a nested object, it means that the filter is
     * related to another table. For example, if we want to filter
     * the users by their address and with the city, we will have to do something
     * like this:
     *
     * filter: {
     *  address: { // This is the related table
     *    city: 'London' // This is the related field and value
     *  }
     * }
     *
     * This will create a condition like this:
     * this.queryBuilder[this.where]('"address"."city" = :name', { name: 'London' })
     *
     * when filter is not nested object, it will create a condition like this:
     * this.queryBuilder[this.where]('data.name = :name', { name: 'John' })
     */
    if (filter.length) {
      filter.forEach(([key, prop]) => {
        if (!prop) {
          return
        }

        const operator: string = (prop?.deny && '!=') || '='
        let condition = `data.${key} ${operator} :${key}`
        let attributes = {
          [key]: prop?.value || prop,
        }

        if (typeof prop === 'object' && !prop.hasOwnProperty('deny')) {
          const [relatedTableKey] = Object.keys(prop)

          if (!prop[relatedTableKey]) {
            return
          }

          condition = `"${key}"."${relatedTableKey}" ${operator} :${relatedTableKey}`

          attributes = {
            [relatedTableKey]: prop[relatedTableKey],
          }
        }

        if (prop.deny === 'DATE_RANGE') {
          const [field] = Object.keys(prop.value)

          if (field && prop.value[field].leading_date) {
            condition = `"data"."${field}" >= :leading_date`
            attributes['leading_date'] = prop.value[field].leading_date
          }

          if (field && prop.value[field].trailing_date) {
            condition = `${condition} AND "data"."${field}" <= :trailing_date`
            attributes['trailing_date'] = prop.value[field].trailing_date
          }

          if (!prop.value[field].trailing_date && !prop.value[field].leading_date) {
            condition = ''
            attributes = {}
          }
        }

        if (condition) {
          this.queryBuilder[this.where](condition, attributes)
        }
      })
    }

    if (search.length) {
      this.queryBuilder[this.where](...search)
    }

    if (includeIds.length) {
      includeIds.forEach((includeId) => this.queryBuilder[this.where](...includeId))
    }

    this.queryBuilder.orderBy(...this.order.createQuery())

    return this.queryBuilder
  }
}
