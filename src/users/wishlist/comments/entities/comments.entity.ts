import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { WishlistCommentStatus } from '@app/src/users/wishlist/comments/enums'
import { WishlistVariantEntity } from '@app/src/users/wishlist/entities/wishlist-variant.entity'

@Entity('wishlist_comments')
export class WishlistCommentEntity extends MyEntity {
  @Column('text', {
    nullable: false,
  })
  comment: string

  @Column('boolean', {
    nullable: false,
    default: false,
  })
  is_anonymous: boolean

  @ManyToOne(() => WishlistVariantEntity)
  @JoinColumn()
  wishlist_variant: WishlistVariantEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => WishlistCommentEntity, (comment) => comment.replies, {
    nullable: true,
  })
  parent: WishlistCommentEntity

  @OneToMany(() => WishlistCommentEntity, (comment) => comment.parent)
  replies: WishlistCommentEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(WishlistCommentStatus),
    default: WishlistCommentStatus.PUBLISHED,
    nullable: false,
  })
  status: WishlistCommentStatus
}
