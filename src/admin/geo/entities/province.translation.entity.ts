import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { ProvinceEntity } from './province.entity'

@Entity('province_translations')
export class ProvinceTranslationEntity extends MyEntity {
  @Column({
    length: 100,
    nullable: false,
    type: 'varchar',
    comment: 'Province name',
  })
  name: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => ProvinceEntity, (province) => province.translations)
  province: ProvinceEntity
}
