import { Module } from '@nestjs/common'
import { AllocationController } from './allocation.controller'
import { AllocationService } from './allocation.service'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'

@Module({
  imports: [BlockchainModule],
  controllers: [AllocationController],
  providers: [AllocationService],
  exports: [AllocationService],
})
export class AllocationModule {}
