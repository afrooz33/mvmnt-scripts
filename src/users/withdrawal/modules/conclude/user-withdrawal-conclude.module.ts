import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubgraphStrategy } from '@app/src/shared/auth/strategies'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { UserWithdrawalEntity } from '@app/src/users/withdrawal/entities/user-withdrawal.entity'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { UserWithdrawalPointMapEntity } from '@app/src/users/withdrawal/entities/user-withdrawal-point-map.entity'
import { UserWithdrawalConcludeService } from './user-withdrawal-conclude.service'
import { UserWithdrawalConcludeController } from './user-withdrawal-conclude.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserWithdrawalEntity,
      UserWithdrawalPointMapEntity,
      UserPointUpdatesEntity,
      NotificationEntity,
    ]),
    ConfigModule,
  ],
  providers: [UserWithdrawalConcludeService, SubgraphStrategy],
  controllers: [UserWithdrawalConcludeController],
  exports: [UserWithdrawalConcludeService],
})
export class UserWithdrawalConcludeModule {}
