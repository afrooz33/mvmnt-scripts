import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WishlistCommentService } from './comments.service'
import { WishlistCommentController } from './comments.controller'
import { WishlistCommentEntity } from './entities/comments.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { WishlistVariantEntity } from '@app/src/users/wishlist/entities/wishlist-variant.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([WishlistCommentEntity, WishlistVariantEntity, BuynowCartEntity]),
  ],
  controllers: [WishlistCommentController],
  providers: [WishlistCommentService],
  exports: [WishlistCommentService],
})
export class WishlistCommentModule {}
