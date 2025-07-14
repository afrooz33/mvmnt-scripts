import { Column, Entity, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { WishlistItemPriority } from '@app/src/users/wishlist/enums'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { WishlistEntity } from './wishlist.entity'
import { toResponseObject } from './methods'

@Entity('wishlist_variants')
@Unique(['wishlist', 'variant'])
export class WishlistVariantEntity extends MyEntity {
  @Column({
    type: 'int',
    default: 1,
    nullable: false,
  })
  sorting_order: number

  @Column({
    type: 'text',
    nullable: true,
  })
  comment: string

  @Column({
    type: 'enum',
    enum: Object.values(WishlistItemPriority),
    default: null,
    nullable: true,
  })
  priority: WishlistItemPriority

  @Column({
    type: 'int',
    default: 0,
    nullable: true,
  })
  needs: number

  @ManyToOne(() => DealVariantEntity, (variant) => variant.wishlists)
  variant: DealVariantEntity

  @ManyToOne(() => WishlistEntity, (wishlist) => wishlist.variants, {
    onDelete: 'CASCADE',
  })
  wishlist: WishlistEntity

  public toResponseObject = toResponseObject.bind(this)
}
