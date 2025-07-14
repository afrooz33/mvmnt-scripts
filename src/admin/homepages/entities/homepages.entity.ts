import { Column, Entity, JoinColumn, JoinTable, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import {
  HomepageTitle,
  HomepageStatus,
  ContentSelection,
  HomepageContentSearchType,
} from '@app/src/admin/homepages/enums'
import { HomepageContentEntity } from './homepage-content.entity'
import { HomepageTranslationEntity } from './homepages-translation.entity'
import { HomepageSearchConditionsEntity } from './search-conditions.entity'
import { homepageResponseObject } from './methods'

@Entity('homepages')
export class HomepagesEntity extends MyEntity {
  @Column('numeric', { nullable: false })
  display_order: number

  @Column('enum', {
    enum: Object.values(ContentSelection),
    nullable: true,
  })
  selection?: ContentSelection

  @Column({
    type: 'enum',
    enum: Object.values(HomepageTitle),
    default: HomepageTitle.TRENDING_DEALS,
    nullable: false,
  })
  type: HomepageTitle

  @Column({
    type: 'text',
    default: '',
    nullable: true,
  })
  title: string

  @Column({
    type: 'text',
    default: '',
    nullable: true,
  })
  description: string

  @Column({
    type: 'enum',
    enum: Object.values(HomepageStatus),
    default: HomepageStatus.ENABLED,
    nullable: false,
  })
  status: HomepageStatus

  @OneToMany(() => HomepageContentEntity, (content) => content.homepage, {
    cascade: true,
  })
  @JoinTable()
  @JoinColumn()
  contents: HomepageContentEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(HomepageContentSearchType),
    nullable: true,
  })
  search_type?: HomepageContentSearchType

  @OneToMany(
    () => HomepageSearchConditionsEntity,
    (search_condition) => search_condition.homepage,
    {
      cascade: true,
      nullable: true,
    },
  )
  @JoinTable()
  @JoinColumn()
  search_conditions?: HomepageSearchConditionsEntity[]

  @OneToMany(() => HomepageTranslationEntity, (translation) => translation.homepage, {
    cascade: true,
  })
  @JoinTable()
  @JoinColumn()
  translations: HomepageTranslationEntity[]

  public toResponseObject = homepageResponseObject.bind(this)
}
