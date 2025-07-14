import { Module } from '@nestjs/common'
import { DistributionController } from './distribution.controller'
import { DistributionService } from './distribution.service'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'

@Module({
  imports: [BlockchainModule],
  controllers: [DistributionController],
  providers: [DistributionService],
  exports: [DistributionService],
})
export class DistributionModule {}
