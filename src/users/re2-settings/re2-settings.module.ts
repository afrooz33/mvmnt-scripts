import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { Re2SettingsController } from './re2-settings.controller'
import { Re2SettingsService } from './re2-settings.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserDonationsEntity, UserPointsEntity])],
  controllers: [Re2SettingsController],
  providers: [Re2SettingsService],
  exports: [Re2SettingsService],
})
export class Re2SettingsModule {}
