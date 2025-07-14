import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { ContinentEntity } from './continent.entity'

@Entity('continent_translations')
export class ContinentTranslationEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  name: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => ContinentEntity, (continent) => continent.translations)
  @JoinTable()
  continent: ContinentEntity
}
