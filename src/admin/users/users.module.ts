import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProfileModule } from '@app/src/users/profile/profile.module'
import { DonationsModule } from '@app/src/donations/donations.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { NotificationsModule } from '@app/src/notifications/notifications.module'
import { RecurringDonationsModule } from '@app/src/recurring-donations/recurring-donations.module'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ProfileModule,
    AddressModule,
    DonationsModule,
    NotificationsModule,
    RecurringDonationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
