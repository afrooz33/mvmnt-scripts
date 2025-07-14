import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { WishlistRankingCommentsService } from './wishlist-ranking-comments.service'
import { WishlistRankingCommentsController } from './wishlist-ranking-comments.controller'
import { WishlistRankingCommentEntity } from './entities/wishlist-ranking-comment.entity'
import { WishlistRankingCommentLikeEntity } from './entities/wishlist-ranking-comment-like.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BuynowCartEntity,
      WishlistRankingCommentEntity,
      WishlistRankingCommentLikeEntity,
    ]),
    UserModule,
  ],
  controllers: [WishlistRankingCommentsController],
  providers: [WishlistRankingCommentsService],
  exports: [WishlistRankingCommentsService],
})
export class WishlistRankingCommentsModule {}
