import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubgraphStrategy } from '@app/src/shared/auth/strategies'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { UserWithdrawalEntity } from '@app/src/users/withdrawal/entities/user-withdrawal.entity'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { UserWithdrawalPointMapEntity } from '@app/src/users/withdrawal/entities/user-withdrawal-point-map.entity'
import { WalletTransactionHistoryModule } from '@app/src/users/wallet-transaction-history/wallet-transaction-history.module'
import { UserWithdrawalRequestService } from './user-withdrawal-request.service'
import { UserWithdrawalRequestController } from './user-withdrawal-request.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPointsEntity,
      UserWithdrawalEntity,
      UserPointUpdatesEntity,
      UserWithdrawalPointMapEntity,
    ]),
    UserPointsModule,
    ConfigModule,
    BlockchainModule,
    TokensModule,
    WalletTransactionHistoryModule,
  ],
  providers: [UserWithdrawalRequestService, SubgraphStrategy],
  exports: [UserWithdrawalRequestService],
  controllers: [UserWithdrawalRequestController],
})
export class UserWithdrawalRequestModule {}
