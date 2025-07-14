import { Module } from '@nestjs/common'
import { GovernanceController } from './controllers/governance.controller'
import { GovernanceService } from './services/governance.service'
import { BlockchainModule } from './blockchain.module'

@Module({
  imports: [BlockchainModule],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
