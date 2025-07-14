import { Column, Entity, JoinColumn, JoinTable, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { BrandStatus } from '@app/src/admin/brands/enums'
import { BrandTranslationEntity } from '@app/src/admin/brands/entities/brand.translation.entity'
import { toResponseObject } from './methods'

@Entity('brands')
export class BrandEntity extends MyEntity {
  @Column('numeric', { nullable: false })
  display_order: number

  @Column('text', {
    nullable: false,
  })
  name: string

  @Column({
    type: 'enum',
    enum: Object.values(BrandStatus),
    default: BrandStatus.ENABLED,
    nullable: false,
  })
  status: BrandStatus

  @OneToMany(() => BrandTranslationEntity, (translation) => translation.brand, {
    cascade: true,
  })
  @JoinColumn()
  @JoinTable()
  translations: BrandTranslationEntity[]

  public toResponseObject = toResponseObject.bind(this)
}
