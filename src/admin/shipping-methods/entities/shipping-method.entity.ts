import { Entity, Column, JoinColumn, OneToMany, JoinTable, ManyToOne } from 'typeorm'
import { ShippingMethodStatus } from '@app/src/admin/shipping-methods/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { MyEntity } from '@app/src/shared/base'
import { ShippingMethodTranslationEntity } from './shipping-method.translation.entity'
import { toResponseObject } from './methods'

@Entity('shipping_methods')
export class ShippingMethodEntity extends MyEntity {
  @Column('integer', { nullable: false })
  display_order: number

  @ManyToOne(() => ImagesEntity, { cascade: true })
  @JoinColumn()
  image: ImagesEntity

  @OneToMany(() => ShippingMethodTranslationEntity, (translation) => translation.shipping_method, {
    cascade: true,
  })
  @JoinColumn()
  @JoinTable()
  translations: ShippingMethodTranslationEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(ShippingMethodStatus),
    default: ShippingMethodStatus.ENABLED,
  })
  status: ShippingMethodStatus

  public toResponseObject = toResponseObject.bind(this)
}
