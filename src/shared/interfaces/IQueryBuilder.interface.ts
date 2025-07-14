import QueryBuilderDataInterface from './queryBuilderData.interface'

export default interface IQueryBuilder {
  addRelation(relation: string): IQueryBuilder
  addFilter(key: string, value: any, deny?: boolean): IQueryBuilder
  useQuery(repository: any): IQueryBuilder
  create(): QueryBuilderDataInterface
}
