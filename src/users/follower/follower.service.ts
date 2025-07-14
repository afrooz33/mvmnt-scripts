import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { FollowerEntity } from './entities/follower.entity'
import { createService, showFollowerService, showFollowingService } from './services'

@Injectable()
export class FollowerService extends MyService<FollowerEntity> {
  constructor(
    @InjectRepository(FollowerEntity)
    private readonly followerRepository: Repository<FollowerEntity>,
    private readonly notificationsService: NotificationsService,
    private readonly userService: UserService,
  ) {
    super(followerRepository, 'user/followers')
  }

  create = createService.bind(this)
  showFollower = showFollowerService.bind(this)
  showFollowing = showFollowingService.bind(this)
}
