import { MyEntity } from '@app/src/shared/base'
import { ManyToOne, JoinColumn, Column } from 'typeorm'
import { SharedSnsPlatform } from '@app/src/users/share/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { toResponseObject } from '@app/src/users/share/entities/methods'

export class ShareEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity

  @Column('enum', {
    enum: Object.values(SharedSnsPlatform),
    default: SharedSnsPlatform.OTHER,
    nullable: false,
  })
  social_platform: SharedSnsPlatform

  public toResponseObject = toResponseObject.bind(this)
}
