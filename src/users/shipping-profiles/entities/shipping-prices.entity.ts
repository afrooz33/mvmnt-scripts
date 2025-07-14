import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ShippingPriceConditionType } from '@app/src/users/shipping-profiles/enums'
import { PriceRange } from './methods'
import { ShippingZoneEntity } from './shipping-zones.entity'

@Entity('shipping_prices')
export class ShippingPriceEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  name: string

  @Column({
    type: 'int',
    nullable: false,
  })
  price: number

  @Column({
    type: 'boolean',
    nullable: false,
  })
  condition_enabled: boolean

  @Column({
    type: 'enum',
    nullable: true,
    enum: Object.values(ShippingPriceConditionType),
  })
  condition_type: ShippingPriceConditionType

  @Column({
    type: 'json',
    transformer: {
      to: (value: PriceRange | undefined) => {
        if (!value) {
          return {}
        }

        const result: Partial<PriceRange> = {}

        if (value.start !== undefined) {
          result.start = value.start
        }

        if (value.end !== undefined) {
          result.end = value.end
        }

        return Object.keys(result).length ? result : {}
      },
      from: (value: any) => {
        if (!value || typeof value !== 'object') {
          return undefined
        }

        const result: Partial<PriceRange> = {}

        if ('start' in value && value.start !== null) {
          result.start = value.start
        }

        if ('end' in value && value.end !== null) {
          result.end = value.end
        }

        return Object.keys(result).length ? result : undefined
      },
    },
  })
  range: PriceRange | undefined

  @ManyToOne(() => ShippingZoneEntity, (zone) => zone.prices)
  zone: ShippingZoneEntity
}
