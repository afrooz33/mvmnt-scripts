import { Entity, Column, ManyToOne, Index } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from './user.entity'

@Entity('user_sessions')
export class UserSessionEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (user) => user.sessions, { onDelete: 'CASCADE' })
  user: UserEntity

  @Index()
  @Column({ type: 'varchar', length: 500 })
  refresh_token: string

  @Column({ type: 'varchar', nullable: true })
  ip_address: string

  @Column({ type: 'varchar', nullable: true })
  user_agent: string

  @Column()
  expires_at: Date
}
