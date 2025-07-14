import { BigNumber } from 'bignumber.js'
import { SuccessRO } from '@app/src/shared/dto'
import { NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { CreateWalletTransactionHistoryDto } from '@app/src/users/wallet-transaction-history/dto'

export default async function create(dto: CreateWalletTransactionHistoryDto): Promise<SuccessRO> {
  try {
    const ownerUser = await this.userService.userRepository.findOne({
      where: { id: dto.owner_user },
    })

    if (!ownerUser) {
      throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
    }

    const affectedWallet = await this.walletRepository.findOne({
      where: { id: dto.affected_wallet, user: { id: dto.owner_user } },
    })

    if (!affectedWallet) {
      throw new NotFoundException(ErrorKey.WALLET_NOT_FOUND)
    }

    if (!dto.transaction_category) {
      dto.transaction_category = this.getTransactionCategory(dto.transaction_type)
    }

    const historyEntryData: any = {
      owner_user: { id: dto.owner_user },
      affected_wallet: { id: dto.affected_wallet },
      flow_indicator: dto.flow_indicator,
      currency: { id: dto.currency },
      transaction_type: dto.transaction_type,
      transaction_category: dto.transaction_category,
      is_point_exchange: dto.is_point_exchange || false,
      transaction_timestamp: dto.transaction_timestamp || new Date(),
    }

    if (dto.amount !== undefined && dto.amount !== null) {
      historyEntryData.amount = new BigNumber(dto.amount)
    }

    if (dto.points !== undefined && dto.points !== null) {
      historyEntryData.points = new BigNumber(dto.points)
    }

    if (dto.fee_amount !== undefined && dto.fee_amount !== null) {
      historyEntryData.fee_amount = new BigNumber(dto.fee_amount)

      if (dto.fee_currency) {
        historyEntryData.fee_currency = { id: dto.fee_currency }
      }
    }

    if (dto.user_deal_payment) {
      historyEntryData.user_deal_payment = { id: dto.user_deal_payment }
    }

    if (dto.user_deal_item_payment) {
      historyEntryData.user_deal_item_payment = { id: dto.user_deal_item_payment }
    }

    if (dto.is_deal_purchase !== undefined) {
      historyEntryData.is_deal_purchase = dto.is_deal_purchase
    }

    if (dto.is_deal_sale !== undefined) {
      historyEntryData.is_deal_sale = dto.is_deal_sale
    }

    if (dto.donation) {
      historyEntryData.donation = { id: dto.donation }
    }

    if (dto.nonprofit) {
      historyEntryData.nonprofit = { id: dto.nonprofit }
    }

    if (dto.donation_project) {
      historyEntryData.donation_project = { id: dto.donation_project }
    }

    if (dto.fundraiser) {
      historyEntryData.fundraiser = { id: dto.fundraiser }
    }

    if (dto.is_re2_integration !== undefined) {
      historyEntryData.is_re2_integration = dto.is_re2_integration
    }

    if (dto.sender_user) {
      historyEntryData.sender_user = { id: dto.sender_user }
    }

    if (dto.sender_wallet) {
      historyEntryData.sender_wallet = { id: dto.sender_wallet }
    }

    if (dto.sender_external_address) {
      historyEntryData.sender_external_address = dto.sender_external_address
    }

    if (dto.receiver_user) {
      historyEntryData.receiver_user = { id: dto.receiver_user }
    }

    if (dto.receiver_wallet) {
      historyEntryData.receiver_wallet = { id: dto.receiver_wallet }
    }

    if (dto.receiver_external_address) {
      historyEntryData.receiver_external_address = dto.receiver_external_address
    }

    const historyEntry = this.historyRepository.create(historyEntryData)

    await this.historyRepository.save(historyEntry)

    return {
      success: true,
      message: 'Wallet transaction history created successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
