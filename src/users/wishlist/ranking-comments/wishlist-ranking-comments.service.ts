import { Repository, DataSource } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { showService, createService, toggleCommentLikeService } from './services'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { WishlistRankingCommentEntity } from './entities/wishlist-ranking-comment.entity'
import { WishlistRankingCommentLikeEntity } from './entities/wishlist-ranking-comment-like.entity'

@Injectable()
export class WishlistRankingCommentsService extends MyService<WishlistRankingCommentEntity> {
  constructor(
    @InjectRepository(WishlistRankingCommentEntity)
    private readonly rankingCommentRepository: Repository<WishlistRankingCommentEntity>,
    @InjectRepository(WishlistRankingCommentLikeEntity)
    private readonly rankingCommentLikeRepository: Repository<WishlistRankingCommentLikeEntity>,
    @InjectRepository(BuynowCartEntity)
    private readonly cartRepository: Repository<BuynowCartEntity>,
    private readonly userService: UserService,
    @InjectDataSource() private dataSource: DataSource,
  ) {
    super(rankingCommentRepository, 'wishlist/ranking/comments')
  }

  show = showService.bind(this)
  create = createService.bind(this)
  toggleCommentLike = toggleCommentLikeService.bind(this)
}
