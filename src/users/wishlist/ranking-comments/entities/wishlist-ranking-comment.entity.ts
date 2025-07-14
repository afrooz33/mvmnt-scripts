import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { WishlistRankingCommentLikeEntity } from './wishlist-ranking-comment-like.entity'

@Entity('wishlist_ranking_comments')
export class WishlistRankingCommentEntity extends MyEntity {
  @Column('text', { nullable: false })
  comment: string

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  ranked_user: UserEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  commenter: UserEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  wishlist_owner: UserEntity

  @Column('boolean', { default: false })
  is_anonymous: boolean

  @ManyToOne(() => WishlistRankingCommentEntity, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: WishlistRankingCommentEntity

  @OneToMany(() => WishlistRankingCommentEntity, (comment) => comment.parent)
  replies: WishlistRankingCommentEntity[]

  @OneToMany(() => WishlistRankingCommentLikeEntity, (like) => like.comment)
  likes: WishlistRankingCommentLikeEntity[]

  @Column({ type: 'int', default: 0 })
  likes_count: number

  @Column({ type: 'int', default: 0 })
  replies_count: number
}
