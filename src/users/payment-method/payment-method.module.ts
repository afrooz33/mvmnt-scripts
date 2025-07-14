import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { BlockchainModule } from '@app/src/blockchain/blockchain.module'
import { PaymentMethodController } from './payment-method.controller'
import { PaymentCardsEntity } from './entities/payment-cards.entity'
import { PaymentWalletsEntity } from './entities/payment-wallets.entity'
import { PaymentCardsService, PaymentWalletsService, UserCardsService } from './services'

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentWalletsEntity, PaymentCardsEntity]),
    UserModule,
    BlockchainModule,
  ],
  controllers: [PaymentMethodController],
  providers: [PaymentWalletsService, UserCardsService, PaymentCardsService],
  exports: [PaymentWalletsService, PaymentCardsService],
})
export class PaymentMethodModule {}
