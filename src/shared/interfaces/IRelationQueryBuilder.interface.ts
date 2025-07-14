export default interface IRelationQueryBuilder {
  add(relation: string): IRelationQueryBuilder
  create(): string[]
  createQuery(): any[]
}
