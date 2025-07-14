export default interface IPaginationQueryBuilder {
  setPage(page: string): IPaginationQueryBuilder
  setLimit(limit: string): IPaginationQueryBuilder
  create(): any
}
