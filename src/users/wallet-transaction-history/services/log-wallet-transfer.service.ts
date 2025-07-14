import { BigNumber } from 'bignumber.js'
import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import {
  LogWalletTransferDto,
  CreateWalletTransactionHistoryDto,
} from '@app/src/users/wallet-transaction-history/dto'
import {
  TransactionCategory,
  TransactionFlowIndicator,
  WalletHistoryTransactionType,
} from '@app/src/users/wallet-transaction-history/enums'
import { WalletTransactionHistoryEntity } from '@app/src/users/wallet-transaction-history/entities/wallet-transaction-history.entity'

export default async function (userId: string, payload: LogWalletTransferDto): Promise<SuccessRO> {
  // 1. Validate sender's wallet
  const senderWallet = await this.walletRepository.findOne({
    where: { id: payload.sender_wallet, user: { id: userId } },
    relations: ['user'],
  })

  if (!senderWallet) {
    throw new NotFoundException(ErrorKey.WALLET_NOT_FOUND)
  }

  if (!senderWallet.user) {
    throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
  }

  // 2. Validate currency
  const currency = await this.tokensService.tokenWhitelistRepository.findOne({
    where: [{ id: payload.currency }, { address: payload.currency }],
  })

  if (!currency) {
    throw new NotFoundException(ErrorKey.CURRENCY_NOT_FOUND)
  }

  // 3. Find receiver wallet by address
  const receiverWallet = await this.walletRepository.findOne({
    where: { address: payload.receiver_wallet_address },
    relations: ['user'],
  })

  // Use a database transaction to ensure atomicity if both records are created
  return await this.entityManager
    .transaction(async (transactionalEntityManager) => {
      const historyServiceWithTransaction = {
        create: async (dto: CreateWalletTransactionHistoryDto) => {
          const historyRepo = transactionalEntityManager.getRepository(
            WalletTransactionHistoryEntity,
          )

          // Convert amount to BigNumber if it's a string
          if (typeof dto.amount === 'string') {
            dto.amount = new BigNumber(dto.amount)
          }

          // Set default transaction category if not provided
          if (!dto.transaction_category) {
            dto.transaction_category = TransactionCategory.DIRECT_TRANSFER
          }

          const history = historyRepo.create(dto as any)
          return await historyRepo.save(history)
        },
      }

      // 4. Create sender's transaction history (DEBIT)
      const senderHistoryDto: CreateWalletTransactionHistoryDto = {
        owner_user: senderWallet.user.id,
        affected_wallet: senderWallet.id,
        transaction_type: WalletHistoryTransactionType.TOKEN_SENT_TO_USER,
        flow_indicator: TransactionFlowIndicator.DEBIT,
        amount: new BigNumber(payload.amount),
        currency,
        transaction_category: TransactionCategory.DIRECT_TRANSFER,
        transaction_timestamp: new Date(),
        sender_user: senderWallet.user.id,
        sender_wallet: senderWallet.id,
        transaction_hash: payload.transaction_hash,
      }

      if (receiverWallet && receiverWallet.user) {
        Object.assign(senderHistoryDto, {
          receiver_user: receiverWallet.user.id,
          receiver_wallet: receiverWallet.id,
        })
      } else {
        Object.assign(senderHistoryDto, {
          receiver_external_address: payload.receiver_wallet_address,
        })
      }

      await historyServiceWithTransaction.create(senderHistoryDto)
      this.logger.log(`Sender's debit transaction history logged for wallet ${senderWallet.id}.`)

      // 5. Create receiver's transaction history (CREDIT), if internal
      if (receiverWallet && receiverWallet.user) {
        // Prevent logging duplicate history if sender and receiver wallets are the same.
        if (senderWallet.id === receiverWallet.id) {
          this.logger.log(
            `Sender and receiver wallet are the same (${senderWallet.id}). Skipping receiver credit log.`,
          )
        } else {
          const receiverHistoryDto: CreateWalletTransactionHistoryDto = {
            owner_user: receiverWallet.user.id, // Receiver is the owner of this history entry
            affected_wallet: receiverWallet.id,
            transaction_type: WalletHistoryTransactionType.TOKEN_RECEIVED_FROM_USER,
            flow_indicator: TransactionFlowIndicator.CREDIT,
            amount: new BigNumber(payload.amount),
            currency,
            transaction_category: TransactionCategory.DIRECT_TRANSFER,
            transaction_timestamp: new Date(),
            sender_user: senderWallet.user.id,
            sender_wallet: senderWallet.id,
            receiver_user: receiverWallet.user.id,
            receiver_wallet: receiverWallet.id,
            transaction_hash: payload.transaction_hash,
          }

          await historyServiceWithTransaction.create(receiverHistoryDto)
          this.logger.log(
            `Receiver's credit transaction history logged for wallet ${receiverWallet.id}.`,
          )
        }
      }
      return {
        success: true,
        message: 'Wallet transfer logged successfully.',
      }
    })
    .catch((error) => {
      this.logger.error(`Failed to log wallet transfer: ${error.message}`, error.stack)
      return HandleErrors(error)
    })
}
