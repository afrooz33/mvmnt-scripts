import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { CountryEntity } from './country.entity'

@Entity('country_translations')
export class CountryTranslationEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  name: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => CountryEntity, (countries) => countries.translations)
  @JoinColumn()
  country: CountryEntity
}
