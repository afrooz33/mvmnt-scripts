import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { DisplaySetting, WishlistStatus } from '@app/src/users/wishlist/enums'
import { WishlistVariantEntity } from './wishlist-variant.entity'

@Entity('wishlists')
export class WishlistEntity extends MyEntity {
  @Column('varchar', { nullable: false, length: 80 })
  title: string

  @Column('varchar', { nullable: true, length: 250 })
  description: string

  @Column('timestamp with time zone', { nullable: true })
  purchase_deadline: Date

  @Column({
    type: 'enum',
    enum: Object.values(DisplaySetting),
    default: DisplaySetting.REMOVE_ITEM_FROM_LIST,
    nullable: false,
  })
  display_setting: DisplaySetting

  @Column({
    type: 'enum',
    enum: Object.values(WishlistStatus),
    default: WishlistStatus.PUBLIC,
    nullable: false,
  })
  status: WishlistStatus

  @OneToOne(() => ImagesEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  image: ImagesEntity

  @ManyToOne(() => UserEntity, (user) => user.wishlists)
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => TagEntity, { nullable: true })
  @JoinColumn()
  tag: TagEntity

  @ManyToOne(() => AddressEntity, { nullable: true })
  @JoinColumn()
  address: AddressEntity

  @OneToMany(() => WishlistVariantEntity, (variants) => variants.wishlist)
  @JoinColumn()
  variants: WishlistVariantEntity[]
}
