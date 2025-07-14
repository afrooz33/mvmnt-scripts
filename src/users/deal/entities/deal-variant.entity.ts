import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ReturnEligibility } from '@app/src/users/deal/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { WishlistEntity } from '@app/src/users/wishlist/entities/wishlist.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { ProductTagSettingsEntity } from '@app/src/users/delivery-settings/product-tag/entities/product-tag-settings.entity'
import { DealEntity } from './deal.entity'
import { DealOptionValueEntity } from './deal-option-value.entity'
import { DealVariantInventoryEntity } from './deal-variant-inventory.entity'

@Entity('deal_variants')
export class DealVariantEntity extends MyEntity {
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  original_price: number

  @ManyToMany(() => ImagesEntity, (image) => image.deal_variants, {
    cascade: true,
  })
  @JoinTable()
  images: ImagesEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(ReturnEligibility),
    default: ReturnEligibility.MAKE_RETURNABLE,
    nullable: false,
  })
  return_eligibility: ReturnEligibility

  @ManyToOne(() => DealEntity, (deal) => deal.variants)
  deal: DealEntity

  @ManyToMany(() => DealOptionValueEntity, {
    cascade: true,
  })
  @JoinTable()
  option_values: DealOptionValueEntity[]

  @OneToMany(() => BuynowCartItemEntity, (cart) => cart.variant)
  cart_item?: BuynowCartItemEntity[]

  @ManyToMany(() => ShippingProfileEntity, (shipping_profile) => shipping_profile.variants)
  shipping_profiles: ShippingProfileEntity[]

  @ManyToMany(() => WishlistEntity, (wishlist) => wishlist.variants)
  wishlists: WishlistEntity[]

  @OneToMany(() => DealVariantInventoryEntity, (inventory) => inventory.variant, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  inventory: DealVariantInventoryEntity[]

  @ManyToOne(
    () => ProductTagSettingsEntity,
    (product_tag_settings) => product_tag_settings.variants,
    {
      nullable: true,
    },
  )
  @JoinColumn({ name: 'productTagId' })
  product_tag: ProductTagSettingsEntity
}
