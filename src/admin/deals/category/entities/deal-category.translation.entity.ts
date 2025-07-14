import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { DealCategoryEntity } from './deal-category.entity'

@Entity('deal_category_translations')
export class DealCategoryTranslationEntity extends MyEntity {
  @Column('text', {
    nullable: false,
  })
  name: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => DealCategoryEntity, (category) => category.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  category: DealCategoryEntity
}
