import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { RestrictionType } from '@app/src/users/restrictions/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Entity('user_restrictions')
@Unique(['user', 'restriction_type'])
export class RestrictionsEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity

  @Column({
    type: 'enum',
    enum: Object.values(RestrictionType),
    nullable: false,
  })
  restriction_type: RestrictionType

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  data: any
}
