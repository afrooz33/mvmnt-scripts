import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { DonationPreset } from '@app/src/nonprofit/profile/entities/properties'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { FundraiserStatus, FundraiserType, GoalSettings } from '@app/src/re2/fundraisers/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { toResponseObject } from './methods'

@Entity('re2_fundraisers')
export class FundraiserEntity extends MyEntity {
  @Column({ type: 'text', nullable: false })
  title: string

  @Column({ type: 'text', nullable: false })
  public_url: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'text', nullable: true })
  hex_page_color: string

  @Column({ type: 'text', nullable: true })
  hex_form_color: string

  @Column({
    type: 'enum',
    enum: Object.values(GoalSettings),
    nullable: true,
  })
  goal_settings: GoalSettings

  @Column({
    type: 'enum',
    enum: Object.values(FundraiserType),
    nullable: false,
  })
  type: FundraiserType

  @Column({
    type: 'decimal',
    nullable: true,
    default: 0,
  })
  goal_amount: number

  @Column('timestamp with time zone', { nullable: true })
  start_date: Date

  @Column('timestamp with time zone', { nullable: true })
  end_date: Date

  @Column('jsonb', { nullable: true })
  donation_presets: DonationPreset

  @Column({
    type: 'numeric',
    default: 0,
    nullable: false,
  })
  default_donation_preset_amount: string

  @ManyToMany(() => ImagesEntity, (image) => image.fundraisers, {
    cascade: true,
  })
  @JoinTable({ name: 're2_fundraisers_images' })
  images: ImagesEntity[]

  @ManyToMany(() => NonprofitUserEntity, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({ name: 're2_fundraisers_nonprofit_users' })
  nonprofit: NonprofitUserEntity[]

  @ManyToMany(() => DonationProjectEntity, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({ name: 're2_fundraisers_donation_projects' })
  donation_projects: DonationProjectEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(FundraiserStatus),
    nullable: false,
  })
  status: FundraiserStatus

  @Column({
    type: 'enum',
    enum: Object.values(FundraiserStatus),
    nullable: true,
    default: null,
  })
  old_status?: FundraiserStatus

  @ManyToOne(() => Re2UserEntity, (user) => user.fundraisers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: Re2UserEntity

  public toResponseObject = toResponseObject.bind(this)
}
