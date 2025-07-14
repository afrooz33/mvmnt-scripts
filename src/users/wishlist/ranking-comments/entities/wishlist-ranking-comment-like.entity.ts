import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { WishlistRankingCommentEntity } from './wishlist-ranking-comment.entity'

@Entity('wishlist_ranking_comment_likes')
@Unique(['comment', 'user'])
export class WishlistRankingCommentLikeEntity extends MyEntity {
  @ManyToOne(() => WishlistRankingCommentEntity, (comment) => comment.likes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  comment: WishlistRankingCommentEntity

  @ManyToOne(() => UserEntity, { nullable: false, eager: false })
  @JoinColumn()
  user: UserEntity
}
