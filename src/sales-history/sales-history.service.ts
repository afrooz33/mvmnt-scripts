import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { OrderCancellationEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation.entity'
import { OrderReturnExchangeEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange.entity'
import { OrderCancellationItemEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation-item.entity'
import { OrderReturnExchangeItemEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange-item.entity'
import {
  showService,
  showOneService,
  showReturnRequestService,
  showReturnRequestsService,
} from './services'

@Injectable()
export class SalesHistoryService extends MyService<UserDealPaymentEntity> {
  constructor(
    @InjectRepository(UserDealPaymentEntity)
    private readonly userDealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(OrderReturnExchangeEntity)
    private readonly orderReturnExchangeRepository: Repository<OrderReturnExchangeEntity>,
    @InjectRepository(OrderReturnExchangeItemEntity)
    private readonly orderReturnExchangeItemRepository: Repository<OrderReturnExchangeItemEntity>,
    @InjectRepository(OrderCancellationEntity)
    private readonly orderCancellationRepository: Repository<OrderCancellationEntity>,
    @InjectRepository(OrderCancellationItemEntity)
    private readonly orderCancellationItemRepository: Repository<OrderCancellationItemEntity>,
  ) {
    super(userDealPaymentRepository, 'sales-history')
  }

  show = showService.bind(this)
  showOne = showOneService.bind(this)
  showReturnRequest = showReturnRequestService.bind(this)
  showReturnRequests = showReturnRequestsService.bind(this)
}
