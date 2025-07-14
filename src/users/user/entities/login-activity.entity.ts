import { Entity, ManyToOne, CreateDateColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from './user.entity'

@Entity('login_activity')
export class LoginActivity extends MyEntity {
  @ManyToOne(() => UserEntity, (user) => user.login_activity, {
    nullable: false,
  })
  user: UserEntity

  @CreateDateColumn({ type: 'timestamp with time zone' })
  login_time: Date
}
