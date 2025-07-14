import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandTokenRequestEntity } from './entities/brand-token-request.entity'
import { BrandTokenEntity } from './entities/brand-token.entity'
import { BrandTokenOfferingEntity } from './entities/brand-token-offering.entity'
import { BrandTokenOfferingPhaseEntity } from './entities/brand-token-offering-phase.entity'
import { BrandTokenPhaseWhitelistEntity } from './entities/brand-token-phase-whitelist.entity'
import { BrandTokenPhaseParticipantEntity } from './entities/brand-token-phase-participant.entity'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BrandTokenRequestEntity,
      BrandTokenEntity,
      BrandTokenOfferingEntity,
      BrandTokenOfferingPhaseEntity,
      BrandTokenPhaseWhitelistEntity,
      BrandTokenPhaseParticipantEntity,
      UserEntity,
    ]),
    BlockchainModule,
  ],
  exports: [TypeOrmModule],
})
export class BrandTokensModule {}
