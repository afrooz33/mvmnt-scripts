import { Column, Entity, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { FollowType } from '@app/src/users/follower/enums'

@Entity('users_followers')
@Unique(['follower', 'following'])
export class FollowerEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (user) => user.followers)
  follower: UserEntity

  @ManyToOne(() => UserEntity, (user) => user.following)
  following: UserEntity

  @Column('enum', {
    enum: Object.values(FollowType),
    default: FollowType.PROFILE,
  })
  type: FollowType
}
