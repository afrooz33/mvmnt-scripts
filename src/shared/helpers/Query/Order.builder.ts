import { OrderDirection } from '@app/shared/enums'
import { IOrderQueryBuilder } from '@app/src/shared/interfaces'

export class OrderQueryBuilder implements IOrderQueryBuilder {
  private orderBy: string
  private direction: string

  constructor() {
    this.orderBy = 'created'
    this.direction = OrderDirection.DESCENDING
  }

  public setBy(orderBy: string): IOrderQueryBuilder {
    if (orderBy) {
      this.orderBy = orderBy
    }

    return this
  }

  public setDirection(direction: string): IOrderQueryBuilder {
    if (direction) {
      this.direction = direction
    }

    return this
  }

  public create(): any {
    return {
      [this.orderBy]: this.direction,
    }
  }

  public createQuery(): string[] {
    return [`data.${this.orderBy}`, this.direction]
  }
}
