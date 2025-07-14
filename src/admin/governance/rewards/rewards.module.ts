import { Module } from '@nestjs/common'
import { RewardsController } from './rewards.controller'
import { RewardsService } from './rewards.service'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'

@Module({
  imports: [BlockchainModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
