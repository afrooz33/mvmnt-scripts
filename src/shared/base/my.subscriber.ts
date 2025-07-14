import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm'

export class MyEventSubscriber<Entity> implements EntitySubscriberInterface<Entity> {
  constructor(
    readonly dataSource: DataSource,
    private readonly myEntity: any,
  ) {
    this.dataSource.subscribers.push(this)
  }

  listenTo(): ReturnType<EntitySubscriberInterface['listenTo']> {
    return this.myEntity
  }

  /**
   * Called before resource insertion.
   */
  async beforeInsert(event: InsertEvent<any>) {
    event.entity.display_order = (await event.connection.getRepository(this.myEntity).count()) + 1
  }
}
