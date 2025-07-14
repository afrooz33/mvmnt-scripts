import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandTokenRequestEntity } from '@app/src/brand-tokens/entities/brand-token-request.entity'
import { BrandTokensController } from './brand-tokens.controller'
import { BrandTokensService } from './brand-tokens.service'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { BrandTokenEntity } from '@app/src/brand-tokens/entities/brand-token.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BrandTokenRequestEntity,
      PaymentWalletsEntity,
      BrandTokenEntity,
      UserEntity,
    ]),
    BlockchainModule,
  ],
  controllers: [BrandTokensController],
  providers: [BrandTokensService],
  exports: [BrandTokensService],
})
export class BrandTokensModule {}
