import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { ImagesModule } from '@app/src/images/images.module'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { BrandTokensController } from '@app/src/users/brand-tokens/brand-tokens.controller'
import { BrandTokensService } from '@app/src/users/brand-tokens/brand-tokens.service'
import { BrandTokenRequestEntity } from '@app/src/brand-tokens/entities/brand-token-request.entity'
import { BrandTokenEntity } from '@app/src/brand-tokens/entities/brand-token.entity'
import { BrandTokenOfferingEntity } from '@app/src/brand-tokens/entities/brand-token-offering.entity'
import { BrandTokenOfferingPhaseEntity } from '@app/src/brand-tokens/entities/brand-token-offering-phase.entity'
import { BrandTokenPhaseWhitelistEntity } from '@app/src/brand-tokens/entities/brand-token-phase-whitelist.entity'
import { BrandTokenPhaseParticipantEntity } from '@app/src/brand-tokens/entities/brand-token-phase-participant.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'

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
      PaymentWalletsEntity,
      BrandEntity,
    ]),
    ConfigModule,
    ImagesModule,
    BlockchainModule,
  ],
  controllers: [BrandTokensController],
  providers: [BrandTokensService],
  exports: [BrandTokensService],
})
export class BrandTokensModule {}
