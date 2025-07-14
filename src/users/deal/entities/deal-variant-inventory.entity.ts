import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { DealVariantEntity } from './deal-variant.entity'

@Unique(['variant', 'origin'])
@Entity('deal_variant_inventory')
export class DealVariantInventoryEntity extends MyEntity {
  @Column({
    type: 'numeric',
    nullable: false,
  })
  quantity: number

  @ManyToOne(() => DealVariantEntity, (variant) => variant.inventory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  variant: DealVariantEntity

  @ManyToOne(() => AddressEntity, { nullable: true })
  @JoinColumn()
  origin: AddressEntity
}
