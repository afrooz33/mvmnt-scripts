import { Repository, DataSource } from 'typeorm'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { WishlistEntity } from '@app/src/users/wishlist/entities/wishlist.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { OrderShippingEntity } from '@app/src/sales-history/shipping/entities/order-shipping.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { OrderCancellationEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation.entity'
import { OrderReturnExchangeEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange.entity'
import { OrderCancellationItemEntity } from '@app/src/purchase-history/cancel-order/entities/order-cancellation-item.entity'
import { OrderReturnExchangeItemEntity } from '@app/src/purchase-history/refund-exchange/entities/order-return-exchange-item.entity'

export interface PurchaseDetailsDependencies {
  userDealPaymentRepository: Repository<UserDealPaymentEntity>
  cartRepository: Repository<BuynowCartEntity>
  cartItemRepository: Repository<BuynowCartItemEntity>
  bidRepository: Repository<BidEntity>
  wishlistRepository?: Repository<WishlistEntity>
  rafflePurchaseRepository: Repository<RafflePurchaseEntity>
  orderShippingRepository: Repository<OrderShippingEntity>
  returnExchangeRepository: Repository<OrderReturnExchangeEntity>
  returnExchangeItemRepository: Repository<OrderReturnExchangeItemEntity>
  orderCancellationRepository: Repository<OrderCancellationEntity>
  orderCancellationItemRepository: Repository<OrderCancellationItemEntity>
  dataSource: DataSource
}
