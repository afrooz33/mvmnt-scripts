import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { CountryEntity } from './country.entity'
import { provinceResponseObject } from './methods'
import { ProvinceTranslationEntity } from './province.translation.entity'

@Entity('provinces')
export class ProvinceEntity extends MyEntity {
  @Column({
    length: 100,
    nullable: false,
    type: 'varchar',
    comment: 'Province name',
  })
  name: string

  @ManyToOne(() => CountryEntity, (country) => country.provinces)
  @JoinColumn()
  country: CountryEntity

  @OneToMany(() => ProvinceTranslationEntity, (translation) => translation.province, {
    cascade: true,
  })
  @JoinTable()
  translations: ProvinceTranslationEntity[]

  public toResponseObject = provinceResponseObject.bind(this)
}
