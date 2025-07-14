import { Entity, JoinColumn, JoinTable, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { toResponseObject } from './methods'

@Entity('user_deals_likes')
@Unique(['user', 'deal'])
export class LikeEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (users) => users.liked_deals)
  @JoinColumn()
  @JoinTable()
  user: UserEntity

  @ManyToOne(() => DealEntity, (deal) => deal.liked_deals)
  @JoinColumn()
  @JoinTable()
  deal: DealEntity

  public toResponseObject = toResponseObject.bind(this)
}
