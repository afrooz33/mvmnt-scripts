import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealCategoryStatus, DealCategoryType } from '@app/src/admin/deals/category/enums'
import { DealCategoryTranslationEntity } from './deal-category.translation.entity'
import { toResponseObject } from './methods'

@Entity('deal_categories')
export class DealCategoryEntity extends MyEntity {
  @Column('integer', { nullable: false })
  display_order: number

  @Column('text', {
    nullable: false,
  })
  name: string

  @ManyToOne(() => DealCategoryEntity, (helpCategory) => helpCategory.children)
  parent: DealCategoryEntity

  @OneToMany(() => DealCategoryEntity, (helpCategory) => helpCategory.parent)
  children: DealCategoryEntity[]

  @OneToMany(() => DealCategoryTranslationEntity, (translation) => translation.category, {
    cascade: true,
  })
  @JoinColumn()
  @JoinTable()
  translations: DealCategoryTranslationEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(DealCategoryType),
    default: DealCategoryType.BIG,
    nullable: false,
  })
  type: DealCategoryType

  @Column({
    type: 'enum',
    enum: Object.values(DealCategoryStatus),
    default: DealCategoryStatus.ENABLED,
    nullable: false,
  })
  status: DealCategoryStatus

  public toResponseObject = toResponseObject.bind(this)
}
