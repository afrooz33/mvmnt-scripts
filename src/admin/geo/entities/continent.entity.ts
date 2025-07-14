import { Entity, Unique, Column, OneToMany, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ContinentTranslationEntity } from './continent.translation.entity'
import { CountryEntity } from './country.entity'
import { continentResponseObject } from './methods'

@Entity('continents')
@Unique(['name', 'code'])
export class ContinentEntity extends MyEntity {
  @Column({
    length: 20,
    nullable: false,
    type: 'varchar',
    comment: 'Continent name',
  })
  name: string

  @Column({
    length: 2,
    nullable: false,
    type: 'varchar',
    comment: 'Continent code',
  })
  code: string

  @OneToMany(() => ContinentTranslationEntity, (translation) => translation.continent, {
    cascade: true,
  })
  @JoinColumn()
  translations: ContinentTranslationEntity[]

  @OneToMany(() => CountryEntity, (country) => country.continent)
  @JoinColumn()
  countries: CountryEntity[]

  public toResponseObject = continentResponseObject.bind(this)
}
