import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Entity('users_email_change')
export class EmailChangeEntity extends MyEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string

  @Column({ type: 'char', length: 6, nullable: false })
  token: string

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  expires_at: Date

  @OneToOne(() => UserEntity, (user) => user.email_changes, {
    cascade: true,
  })
  @JoinColumn()
  user: UserEntity
}
