import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubgraphStrategy } from '@app/src/shared/auth/strategies'
import { UserWithdrawalService } from './user-withdrawal.service'
import { UserWithdrawalController } from './user-withdrawal.controller'
import { UserWithdrawalEntity } from './entities/user-withdrawal.entity'
import { UserWithdrawalPointMapEntity } from './entities/user-withdrawal-point-map.entity'
import { UserWithdrawalRequestModule } from './modules/request/user-withdrawal-request.module'
import { UserWithdrawalConcludeModule } from './modules/conclude/user-withdrawal-conclude.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWithdrawalEntity, UserWithdrawalPointMapEntity]),
    ConfigModule,
    UserWithdrawalRequestModule,
    UserWithdrawalConcludeModule,
  ],
  controllers: [UserWithdrawalController],
  providers: [SubgraphStrategy, UserWithdrawalService],
  exports: [UserWithdrawalService, UserWithdrawalRequestModule, UserWithdrawalConcludeModule],
})
export class UserWithdrawalModule {}
