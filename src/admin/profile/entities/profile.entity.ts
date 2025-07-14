import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'

@Entity('admin_profiles')
export class AdminProfileEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  notification_email: string

  @Column('text', { nullable: true })
  timezone: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @OneToOne(() => AdminUserEntity, (admin) => admin.admin_profile, {
    cascade: true,
  })
  @JoinTable()
  @JoinColumn()
  admin_user: AdminUserEntity
}
