import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { toResponseObject } from './methods'

@Entity('user_recently_viewed_deals')
@Unique(['user', 'deal'])
export class RecentlyViewedDealEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (users) => users.recently_viewed)
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => DealEntity, (deal) => deal.recently_viewed, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  deal: DealEntity

  public toResponseObject = toResponseObject.bind(this)
}
