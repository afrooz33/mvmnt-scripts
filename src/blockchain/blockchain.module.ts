import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BlockchainService } from './blockchain.service'
import { SmartContractService } from './smart-contract.service'
import { SubgraphService } from './services/subgraph.service'
import { BrandManagerService } from './services/brand-manager.service'
import { StakingManagerService } from './services/staking-manager.service'
import { LiquidityPoolService } from './services/liquidity-pool.service'
import { StableTokenService } from './services/stable-token.service'
import { GovernanceService } from './services/governance.service'
import { PoolService } from './services/pool.service'
import { PoolController } from './controllers/pool.controller'
import { LPManagerService } from './services/lp-manager.service'
import { LPManagerController } from './controllers/lp-manager.controller'
import { StakingManagerController } from './controllers/staking-manager.controller'
import { PerkNFTService } from './services/perkNFT.service'
import { PerkNFTController } from './controllers/perkNFT.controller'
import { PerkManagerController } from './controllers/perk-manager.controller'
import { PerkManagerService } from './services/perk-manager.service'

@Module({
  imports: [ConfigModule],
  controllers: [
    PoolController,
    LPManagerController,
    StakingManagerController,
    PerkNFTController,
    PerkManagerController,
  ],
  providers: [
    BlockchainService,
    SmartContractService,
    SubgraphService,
    LiquidityPoolService,
    StableTokenService,
    BrandManagerService,
    StakingManagerService,
    GovernanceService,
    PoolService,
    LPManagerService,
    PerkNFTService,
    PerkManagerService,
  ],
  exports: [
    BlockchainService,
    SmartContractService,
    SubgraphService,
    LiquidityPoolService,
    StableTokenService,
    BrandManagerService,
    StakingManagerService,
    GovernanceService,
    PoolService,
    LPManagerService,
    PerkNFTService,
    PerkManagerService,
  ],
})
export class BlockchainModule {}
