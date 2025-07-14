import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { WishlistEntity } from './entities/wishlist.entity'
import { TagsModule } from '@app/src/admin/tags/tags.module'
import { ImagesModule } from '@app/src/images/images.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { WishlistController } from './wishlist.controller'
import { WishlistService } from './wishlist.service'
import { WishlistVariantEntity } from './entities/wishlist-variant.entity'
import { WishlistCommentModule } from './comments/comments.module'
import { WishlistRankingCommentsModule } from './ranking-comments/wishlist-ranking-comments.module'
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AddressEntity,
      WishlistEntity,
      BuynowCartEntity,
      DealVariantEntity,
      WishlistVariantEntity,
    ]),
    TagsModule,
    UserModule,
    ImagesModule,
    AddressModule,
    WishlistCommentModule,
    WishlistRankingCommentsModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
