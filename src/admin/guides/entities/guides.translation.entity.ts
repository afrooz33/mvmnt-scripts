import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { GuidesEntity } from '@app/src/admin/guides/entities/guides.entity'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'

@Entity('guide_translations')
export class GuidesTranslationEntity extends MyEntity {
  @Column('text', { nullable: false })
  name: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => GuidesEntity, (category) => category.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  category: GuidesEntity
}
