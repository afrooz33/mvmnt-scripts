import { Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { toResponseObject } from './methods'

@Entity('user_invitation')
export class InvitationEntity extends MyEntity {
  @ManyToOne(() => UserEntity)
  user: UserEntity

  @ManyToOne(() => UserEntity)
  invited_by: UserEntity

  /**
   * @description Convert the entity to a response object
   * @returns {Record<string, any>} The response object
   */
  public toResponseObject = toResponseObject.bind(this)
}
