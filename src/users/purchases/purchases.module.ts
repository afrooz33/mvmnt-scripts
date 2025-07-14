import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { PurchaseController } from './purchases.controller'
import { PurchaseService } from './purchases.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BidEntity,
      DealEntity,
      AddressEntity,
      BuynowCartEntity,
      RafflePurchaseEntity,
      BuynowCartItemEntity,
      UserDealPaymentEntity,
    ]),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService],
})
export class PurchaseModule {}
