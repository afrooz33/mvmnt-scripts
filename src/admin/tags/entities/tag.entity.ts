import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { TagStatus } from '@app/src/admin/tags/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { TagTranslationEntity } from '@app/src/admin/tags/entities/tag.translation.entity'
import { toResponseObject } from './methods'

@Entity('tags')
@Unique('uq_tag_status', ['name', 'status'])
export class TagEntity extends MyEntity {
  @Column('integer', { nullable: false })
  display_order: number

  @Column({
    type: 'text',
    nullable: false,
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  name: string

  @Column({
    type: 'char',
    length: 7,
    nullable: true,
    default: '#000000',
  })
  hex_color: string

  @OneToMany(() => TagTranslationEntity, (tagTranslation) => tagTranslation.tag, { cascade: true })
  @JoinColumn()
  @JoinTable()
  translations: TagTranslationEntity[]

  @ManyToMany(() => DonationProjectEntity, (donationProject) => donationProject.tags, {
    cascade: true,
  })
  donation_projects: DonationProjectEntity[]

  @ManyToMany(() => NonprofitProfileEntity, (nonprofitProfile) => nonprofitProfile.tags, {
    cascade: true,
  })
  nonprofit_profiles: NonprofitProfileEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(TagStatus),
    default: TagStatus.ACTIVE,
    nullable: false,
  })
  status: TagStatus

  public toResponseObject = toResponseObject.bind(this)
}
