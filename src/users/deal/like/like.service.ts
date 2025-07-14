import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { MyService } from '@app/src/shared/base'
import { InjectRepository } from '@nestjs/typeorm'
import { DealService } from '@app/src/users/deal/deal.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { LikeEntity } from './entities/like.entity'
import { showService, upsertService } from './services'

@Injectable()
export class LikeService extends MyService<LikeEntity> {
  constructor(
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly dealService: DealService,
  ) {
    super(likeRepository, 'users/deal/likes', ['user', 'deal'])
  }

  show = showService.bind(this)
  upsert = upsertService.bind(this)
}
