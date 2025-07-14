import { Repository, DataSource } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { DealService } from '@app/src/users/deal/deal.service'
import { BidEntity } from '@app/src/users/deal/bid/entities/bid.entity'
import { AddressService } from '@app/src/users/address/address.service'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { OrderReturnExchangeEntity } from './entities/order-return-exchange.entity'
import { OrderReturnShipmentEntity } from './entities/order-return-shipment.entity'
import { OrderReturnExchangeLogEntity } from './entities/order-return-exchange-log.entity'
import { OrderReturnExchangeItemEntity } from './entities/order-return-exchange-item.entity'
import {
  createService,
  showHistoryService,
  getReturnStatusService,
  sellerUpdateStatusService,
  shipReturnExchangeService,
} from './services'

@Injectable()
export class ReturnExchangeService {
  constructor(
    @InjectRepository(OrderReturnExchangeEntity)
    private readonly returnExchangeRepository: Repository<OrderReturnExchangeEntity>,
    @InjectRepository(OrderReturnExchangeItemEntity)
    private readonly returnExchangeItemRepository: Repository<OrderReturnExchangeItemEntity>,
    @InjectRepository(OrderReturnShipmentEntity)
    private readonly returnShipmentRepository: Repository<OrderReturnShipmentEntity>,
    @InjectRepository(BuynowCartEntity)
    private readonly cartRepository: Repository<BuynowCartEntity>,
    @InjectRepository(BuynowCartItemEntity)
    private readonly cartItemRepository: Repository<BuynowCartItemEntity>,
    @InjectRepository(BidEntity)
    private readonly bidRepository: Repository<BidEntity>,
    @InjectRepository(UserDealPaymentEntity)
    private readonly dealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    private readonly dealItemPaymentRepository: Repository<UserDealItemPaymentEntity>,
    private readonly dataSource: DataSource,
    private readonly addressService: AddressService,
    @InjectRepository(OrderReturnExchangeLogEntity)
    private readonly returnExchangeLogRepository: Repository<OrderReturnExchangeLogEntity>,
    private readonly dealService: DealService,
    private readonly blockchainService: BlockchainService,
  ) {}

  /**
   * Always create a request for return/exchange.
   * But before creating, verify that the total quantity requested across
   * all existing requests (that are NOT rejected) + new request doesn't exceed
   * the purchased quantity for each cart item.
   */
  create = createService.bind(this)

  /**
   * Show the history of return/exchange requests for a specific cart item.
   */
  showHistory = showHistoryService.bind(this)

  /**
   * Seller updates the request by approving, partially approving, or rejecting items.
   */
  sellerUpdateStatus = sellerUpdateStatusService.bind(this)

  /**
   * ========== BUYER FLOW (shipping) ==========
   * Buyer ships back the items. They must have at least partial approval
   * or full approval in order to ship.
   */
  shipReturnExchange = shipReturnExchangeService.bind(this)

  /**
   * ========== BUYER FLOW (return status) ==========
   * Get the return status for a specific cart.
   * This is used to display logs of return status changes.
   */
  getReturnStatus = getReturnStatusService.bind(this)

  /**
   * ========== QUERIES ==========
   */
  async findOneReturnExchange(reId: string, userId: string): Promise<OrderReturnExchangeEntity> {
    const found = await this.returnExchangeRepository
      .createQueryBuilder('re')
      .leftJoinAndSelect('re.items', 'items')
      .leftJoinAndSelect('items.cart_item', 'cart_item')
      .leftJoinAndSelect('items.shipments', 'shipments')
      .leftJoin('re.buyer', 'buyer')
      .leftJoin('re.seller', 'seller')
      .where('re.id = :reId', { reId })
      .andWhere('(buyer.id = :userId OR seller.id = :userId)', { userId })
      .getOne()
    if (!found) {
      throw new NotFoundException(`Return/exchange #${reId} not found or no permission.`)
    }
    return found
  }

  async findOneItem(itemId: string, userId: string): Promise<OrderReturnExchangeItemEntity> {
    const found = await this.returnExchangeItemRepository
      .createQueryBuilder('rei')
      .leftJoinAndSelect('rei.return_exchange', 're')
      .leftJoinAndSelect('rei.shipments', 'shipments')
      .leftJoin('re.buyer', 'buyer')
      .leftJoin('re.seller', 'seller')
      .where('rei.id = :itemId', { itemId })
      .andWhere('(buyer.id = :userId OR seller.id = :userId)', { userId })
      .getOne()
    if (!found) {
      throw new NotFoundException(`Return/exchange item #${itemId} not found or no permission.`)
    }
    return found
  }
}
