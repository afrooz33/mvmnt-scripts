import { Module } from '@nestjs/common'
import { GovernanceController } from './governance.controller'
import { GovernanceService } from './governance.service'
import { ProposalsModule } from './proposals/proposals.module'
import { RewardsModule } from './rewards/rewards.module'
import { DistributionModule } from './distribution/distribution.module'
import { AllocationModule } from './allocation/allocation.module'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'

@Module({
  imports: [ProposalsModule, RewardsModule, DistributionModule, AllocationModule, BlockchainModule],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
