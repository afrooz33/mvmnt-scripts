import { Injectable } from '@nestjs/common'
import { Repository, DataSource } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { soldService, showService, sendItemService, showOneService } from './services'

@Injectable()
export class PurchaseService extends MyService<DealEntity> {
  constructor(
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
    @InjectRepository(BuynowCartEntity)
    private readonly cartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    private readonly cartItemRepository: Repository<BuynowCartItemEntity>,
    @InjectRepository(BidEntity)
    private readonly bidRepository: Repository<BidEntity>,
    @InjectRepository(RafflePurchaseEntity)
    private readonly rafflePurchaseRepository: Repository<RafflePurchaseEntity>,
    @InjectRepository(UserDealPaymentEntity)
    private readonly userDealPaymentRepository: Repository<UserDealPaymentEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(dealRepository, 'users/purchases')
  }

  show = showService.bind(this)
  sold = soldService.bind(this)
  showOne = showOneService.bind(this)
  sendItem = sendItemService.bind(this)
}
