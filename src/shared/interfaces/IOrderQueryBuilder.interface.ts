export default interface IOrderQueryBuilder {
  setBy(orderBy: string): IOrderQueryBuilder
  setDirection(direction: string): IOrderQueryBuilder
  create(): any
  createQuery(): string[]
}
