import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { HomepagesEntity } from './homepages.entity'

@Entity('homepage_translations')
export class HomepageTranslationEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  title: string

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => HomepagesEntity, (homepage) => homepage.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  homepage: HomepagesEntity
}
