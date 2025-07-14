import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { FollowerEntity } from './entities/follower.entity'
import { FollowerController } from './follower.controller'
import { FollowerService } from './follower.service'

@Module({
  imports: [TypeOrmModule.forFeature([FollowerEntity]), NotificationsModule, UserModule],
  controllers: [FollowerController],
  providers: [FollowerService],
})
export class FollowerModule {}
