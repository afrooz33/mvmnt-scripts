import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { NotificationEntity } from './entities/notifications.entity'
import { NotificationSettingEntity } from './entities/settings.entity'
import {
  showService,
  showSettingService,
  unreadCountService,
  changeSettingService,
} from './services'

@Injectable()
export class NotificationsService extends MyService<NotificationEntity> {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    @InjectRepository(NotificationSettingEntity)
    private readonly notificationSettingRepository: Repository<NotificationSettingEntity>,
  ) {
    super(notificationRepository, 'user/notifications')
  }

  show = showService.bind(this)
  unreadCount = unreadCountService.bind(this)
  showSetting = showSettingService.bind(this)
  changeSetting = changeSettingService.bind(this)
}
