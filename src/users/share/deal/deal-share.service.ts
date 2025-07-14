import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MyService } from '@app/src/shared/base'
import { DealService } from '@app/src/users/deal/deal.service'
import { UserService } from '@app/src/users/user/user.service'
import { dealShareService } from '@app/src/users/share/services'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { DealShareEntity } from './entities/deal-share.entity'

@Injectable()
export class DealShareService extends MyService<DealShareEntity> {
  constructor(
    @InjectRepository(DealShareEntity)
    private readonly dealShareRepository: Repository<DealShareEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly dealService: DealService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(dealShareRepository, 'user/deal/share')
  }

  dealShare = dealShareService.bind(this)
}
