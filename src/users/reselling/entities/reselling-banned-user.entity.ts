import { Entity, JoinColumn, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Entity('reselling_banned_user')
export class ResellingBannedUserEntity extends MyEntity {
  @OneToOne(() => UserEntity)
  @JoinColumn()
  reseller: UserEntity

  @OneToOne(() => UserEntity)
  @JoinColumn()
  seller: UserEntity
}
