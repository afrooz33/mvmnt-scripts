import { Column, Entity, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from './language.entity'

@Entity('language_alphabets')
@Unique(['alphabet', 'language'])
export class LanguageAlphabetsEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 5,
    nullable: false,
  })
  alphabet: string

  @ManyToOne(() => LanguageEntity, (language) => language.alphabets)
  language: LanguageEntity
}
