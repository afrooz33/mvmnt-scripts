import { IRelationIdsInQueryBuilder } from '@app/src/shared/interfaces'

export class RelationIdsInQueryBuilder implements IRelationIdsInQueryBuilder {
  constructor(private readonly includeIds?: any) {}

  public createQuery(): any[] {
    if (this.includeIds && !Object.keys(this.includeIds).length) {
      return []
    }

    let counter = 0
    const idsIn: any[] = []

    for (const field in this.includeIds) {
      idsIn.push([
        `"${field}"."id" IN (:...ids_${counter})`,
        { [`ids_${counter}`]: this.includeIds[field] },
      ])

      counter++
    }

    return idsIn
  }
}
