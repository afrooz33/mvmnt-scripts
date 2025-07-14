import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { toResponseObject } from '@app/src/re2/profile/entities/methods'

@Entity('re2_profiles')
export class ProfileEntity extends MyEntity {
  @Column('text')
  first_name: string

  @Column('text')
  last_name: string

  @Column({
    type: 'text',
    unique: true,
    nullable: true,
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  notification_email: string

  @Column('text')
  company_name: string

  @Column({ type: 'text', nullable: true })
  phone: string

  @Column('text', { nullable: true })
  timezone: string

  @OneToOne(() => Re2UserEntity, (user) => user.profile, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: Re2UserEntity

  public toResponseObject = toResponseObject.bind(this)
}
