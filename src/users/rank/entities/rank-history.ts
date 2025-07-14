import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserRank } from '@app/src/users/rank/enums/ranks.enums'

@Entity('user_rank_history')
export class UserRankHistoryEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @Column({
    type: 'enum',
    enum: Object.values(UserRank),
    default: UserRank.Bronze,
    nullable: true,
  })
  rank: UserRank
}
