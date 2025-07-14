import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { nonprofitPageShareService } from '@app/src/users/share/services'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { NonprofitShareEntity } from './entities/nonprofit-share.entity'

@Injectable()
export class NonprofitShareService extends MyService<NonprofitShareEntity> {
  constructor(
    @InjectRepository(NonprofitShareEntity)
    private readonly nonprofitShareService: Repository<NonprofitShareEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UserService,
  ) {
    super(nonprofitShareService, 'user/nonprofit/share')
  }

  nonprofitPageShare = nonprofitPageShareService.bind(this)
}
