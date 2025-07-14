import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { donationProjectShareService } from '@app/src/users/share/services'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'
import { DonationProjectShareEntity } from './entities/donation-project-share.entity'

@Injectable()
export class DonationProjectShareService extends MyService<DonationProjectShareEntity> {
  constructor(
    @InjectRepository(DonationProjectShareEntity)
    private readonly donationProjectShareRepository: Repository<DonationProjectShareEntity>,
    private readonly donationProjectService: DonationProjectsService,
    private readonly notificationsService: NotificationsService,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(donationProjectShareRepository, 'user/donation-project/share')
  }

  donationProjectShare = donationProjectShareService.bind(this)
}
