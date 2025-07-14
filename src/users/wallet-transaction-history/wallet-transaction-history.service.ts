import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { TransactionCategory, WalletHistoryTransactionType } from './enums'
import { showService, createService, logWalletTransferService } from './services'
import { WalletTransactionHistoryEntity } from './entities/wallet-transaction-history.entity'

@Injectable()
export class WalletTransactionHistoryService extends MyService<WalletTransactionHistoryEntity> {
  constructor(
    @InjectRepository(WalletTransactionHistoryEntity)
    public readonly historyRepository: Repository<WalletTransactionHistoryEntity>,
    @InjectRepository(PaymentWalletsEntity)
    private readonly walletRepository: Repository<PaymentWalletsEntity>,
    private readonly userService: UserService,
    private readonly entityManager: EntityManager,
    private readonly tokensService: TokensService,
  ) {
    super(historyRepository, 'users/wallet-transaction-history')
  }

  show = showService.bind(this)
  create = createService.bind(this)
  logWalletTransfer = logWalletTransferService.bind(this)

  /**
   * Derives the transaction category from transaction type
   * @param transactionType - The transaction type
   * @returns TransactionCategory
   */
  private getTransactionCategory(
    transactionType: WalletHistoryTransactionType,
  ): TransactionCategory {
    switch (transactionType) {
      case WalletHistoryTransactionType.DEAL_PURCHASE_PAYMENT_SENT:
      case WalletHistoryTransactionType.DEAL_SALE_PROCEEDS_RECEIVED:
        return TransactionCategory.DEAL

      case WalletHistoryTransactionType.TOKEN_DEPOSIT:
      case WalletHistoryTransactionType.TOKEN_WITHDRAWAL:
      case WalletHistoryTransactionType.TOKEN_SENT_TO_USER:
      case WalletHistoryTransactionType.TOKEN_RECEIVED_FROM_USER:
        return TransactionCategory.TOKEN

      case WalletHistoryTransactionType.DONATION_FUNDS_RECEIVED:
      case WalletHistoryTransactionType.DONATION_SENT_DIRECT_PROJECT:
      case WalletHistoryTransactionType.DONATION_SENT_DIRECT_NONPROFIT:
      case WalletHistoryTransactionType.DONATION_SENT_RE2_FUNDRAISER:
      case WalletHistoryTransactionType.DONATION_SENT_RE2_INTEGRATION:
        return TransactionCategory.DONATION

      case WalletHistoryTransactionType.POINTS_EXCHANGED_FOR_TOKENS:
      case WalletHistoryTransactionType.TOKENS_RECEIVED_FROM_POINT_AWARD:
        return TransactionCategory.POINTS

      case WalletHistoryTransactionType.DEAL_REFUND_SENT:
      case WalletHistoryTransactionType.DEAL_REFUND_RECEIVED:
        return TransactionCategory.REFUND

      case WalletHistoryTransactionType.REWARD_PAYOUT_RECEIVED:
        return TransactionCategory.REWARD

      case WalletHistoryTransactionType.ADMIN_WALLET_DEBIT:
      case WalletHistoryTransactionType.ADMIN_WALLET_CREDIT:
        return TransactionCategory.ADMIN

      default:
        return TransactionCategory.TOKEN
    }
  }
}
