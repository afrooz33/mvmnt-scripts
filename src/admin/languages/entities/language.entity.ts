import { Column, Entity, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageStatus } from '@app/src/admin/languages/enums'
import { LanguageAlphabetsEntity } from './language-alphabets.entity'

@Entity('languages')
export class LanguageEntity extends MyEntity {
  @Column({
    type: 'text',
    unique: true,
    nullable: false,
  })
  name: string

  @Column({
    type: 'text',
    unique: true,
    nullable: false,
  })
  code: string

  @Column({
    type: 'enum',
    enum: Object.values(LanguageStatus),
    default: LanguageStatus.ACTIVE,
    nullable: false,
  })
  status: LanguageStatus

  @OneToMany(() => LanguageAlphabetsEntity, (languageAlphabets) => languageAlphabets.language)
  alphabets: LanguageAlphabetsEntity[]
}
