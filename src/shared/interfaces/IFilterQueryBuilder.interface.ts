export default interface IFilterQueryBuilder {
  add(key: string, value: unknown, deny: unknown): IFilterQueryBuilder
  create(): any
  createQuery(): any[]
}
