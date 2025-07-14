import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { TagEntity } from './tag.entity'

@Entity('tag_translations')
export class TagTranslationEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
    transformer: {
      to: (value: string) => value?.toLowerCase(),
      from: (value: string) => value,
    },
  })
  name: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => TagEntity, (tag) => tag.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  tag: TagEntity
}
