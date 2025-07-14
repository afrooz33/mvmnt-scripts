import { Column, Entity, OneToOne, ManyToOne, JoinTable, ManyToMany, JoinColumn } from 'typeorm'
import { toResponseObject } from '@app/src/nonprofit/profile/entities/methods'
import { DonationPreset, SocialAccounts } from '@app/src/nonprofit/profile/entities/properties'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { MyEntity } from '@app/src/shared/base'
import { NonprofitProfileStatus } from '@app/src/nonprofit/profile/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'

@Entity('nonprofit_profiles')
export class NonprofitProfileEntity extends MyEntity {
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
  foundation_name: string

  @Column('text')
  foundation_url: string

  @Column({ type: 'text', nullable: true })
  introduction: string

  @Column({ type: 'text', nullable: true })
  corporate_number: string

  @Column({ type: 'text', nullable: true })
  phone: string

  @Column('jsonb', { nullable: true, default: null })
  social_accounts: SocialAccounts

  @Column('jsonb', { nullable: true })
  donation_presets: DonationPreset

  @Column({
    type: 'numeric',
    default: 0,
    nullable: false,
  })
  default_donation_preset_amount: number

  @Column('text', { nullable: true })
  admin_memo: string

  @Column('text', { nullable: true })
  timezone: string

  @Column({
    type: 'enum',
    enum: Object.values(NonprofitProfileStatus),
    default: NonprofitProfileStatus.REVIEW,
  })
  status: NonprofitProfileStatus

  @OneToOne(() => NonprofitUserEntity, (user) => user.profile, {
    cascade: true,
  })
  @JoinTable()
  @JoinColumn()
  user: NonprofitUserEntity

  @OneToOne(() => ImagesEntity, { cascade: true })
  @JoinColumn()
  profile_image: ImagesEntity

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToMany(() => TagEntity, (tag) => tag.nonprofit_profiles)
  @JoinTable()
  tags: TagEntity[]

  public toResponseObject = toResponseObject.bind(this)
}
