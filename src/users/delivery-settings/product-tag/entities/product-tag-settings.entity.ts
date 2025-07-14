import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DeliverySettingStatus } from '@app/src/users/delivery-settings/enums'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { DeliverySettingsEntity } from '@app/src/users/delivery-settings/entities/delivery-settings.entity'

@Entity('product_tag_settings')
export class ProductTagSettingsEntity extends MyEntity {
  @Column('text', { nullable: false })
  name: string

  @Column('jsonb', { nullable: true })
  days_range: object

  @Column('jsonb', { nullable: true })
  date_range: object

  @Column('boolean', { nullable: false, default: false })
  is_disable_delivery_tag: boolean

  @Column('enum', {
    enum: Object.values(DeliverySettingStatus),
    default: DeliverySettingStatus.ENABLED,
    nullable: false,
  })
  status: DeliverySettingStatus

  @ManyToOne(() => DeliverySettingsEntity, { nullable: false })
  @JoinColumn()
  delivery_settings: DeliverySettingsEntity

  @OneToMany(() => DealVariantEntity, (variant) => variant.product_tag)
  variants: DealVariantEntity[]
}
