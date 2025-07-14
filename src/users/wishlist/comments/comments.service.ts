import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { WishlistVariantEntity } from '@app/src/users/wishlist/entities/wishlist-variant.entity'
import { showService, createService } from './services'
import { WishlistCommentEntity } from './entities/comments.entity'

@Injectable()
export class WishlistCommentService extends MyService<WishlistCommentEntity> {
  constructor(
    @InjectRepository(WishlistCommentEntity)
    protected readonly wishlistCommentRepository: Repository<WishlistCommentEntity>,
    @InjectRepository(WishlistVariantEntity)
    protected readonly wishlistVariantRepository: Repository<WishlistVariantEntity>,
    @InjectRepository(BuynowCartEntity)
    protected readonly buynowCartRepository: Repository<BuynowCartEntity>,
  ) {
    super(wishlistCommentRepository, 'wishlist/comments')
  }

  show = showService.bind(this)
  create = createService.bind(this)
}
