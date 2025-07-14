import { EntityManager, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { WalletTransactionHistoryEntity } from '@app/src/users/wallet-transaction-history/entities/wallet-transaction-history.entity'
import { showService, logWalletTransferService } from './services'

@Injectable()
export class WalletTransactionHistoryService extends MyService<WalletTransactionHistoryEntity> {
  constructor(
    @InjectRepository(WalletTransactionHistoryEntity)
    public readonly historyRepository: Repository<WalletTransactionHistoryEntity>,
    @InjectRepository(PaymentWalletsEntity)
    private readonly walletRepository: Repository<PaymentWalletsEntity>,
    private readonly tokensService: TokensService,
    private readonly entityManager: EntityManager,
  ) {
    super(historyRepository, 'nonprofit/wallet-transaction-history')
  }

  show = showService.bind(this)
  logWalletTransfer = logWalletTransferService.bind(this)
}
