import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { BrandEntity } from './brand.entity'

@Entity('brand_translations')
export class BrandTranslationEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  name: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => BrandEntity, (brand) => brand.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  brand: BrandEntity
}
