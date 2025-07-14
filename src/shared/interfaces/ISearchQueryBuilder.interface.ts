export default interface ISearchQueryBuilder {
  setKeyword(keyword: string): ISearchQueryBuilder
  setFields(fields: string[]): ISearchQueryBuilder
  create(): any[]
  createQuery(): any[]
}
