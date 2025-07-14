import { IRelationQueryBuilder } from '@app/src/shared/interfaces'

export class RelationQueryBuilder implements IRelationQueryBuilder {
  private relations: any

  constructor(private readonly includes?: string[]) {
    this.relations = new Set()

    if (includes) {
      includes.forEach((relation) =>
        relation.split(',').forEach(this.relations.add.bind(this.relations)),
      )
    }
  }

  public add(relation: string): IRelationQueryBuilder {
    this.relations.add(relation)

    return this
  }

  public create(): string[] {
    return [...this.relations]
  }

  public createQuery(): any[] {
    if (!this.relations.size) {
      return []
    }

    // Map to track alias count
    const aliasCountMap = new Map<string, number>()
    const relations: any[] = []

    this.relations.forEach((relation) => {
      const [parent, child] = relation.includes('.') ? relation.split('.') : ['data', relation]

      // Generate a unique alias for the child table
      let alias = child
      const count = aliasCountMap.get(child) || 0

      if (count > 0) {
        alias = `${child}_${count}`
      }

      aliasCountMap.set(child, count + 1)

      // Construct the relation entry
      if (parent !== 'data') {
        relations.push([`${parent}.${child}`, alias])
      } else {
        relations.push([`data.${child}`, alias])
      }
    })

    return relations
  }
}
