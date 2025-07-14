import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { ShippingMethodEntity } from './shipping-method.entity'

@Entity('shipping_method_translations')
export class ShippingMethodTranslationEntity extends MyEntity {
  @Column('text', {
    nullable: false,
  })
  name: string

  @Column('text', {
    nullable: false,
  })
  company: string

  @Column('text', {
    nullable: false,
  })
  max_size: string

  @Column('text', {
    nullable: false,
  })
  max_weight: string

  @Column('text', {
    nullable: false,
  })
  price: string

  @Column('text', {
    nullable: false,
  })
  details_url: string

  @Column('text', {
    nullable: false,
  })
  description: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => ShippingMethodEntity, (shippingMethod) => shippingMethod.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  shipping_method: ShippingMethodEntity
}
