import BigNumber from 'bignumber.js'
import { ConfigService } from '@nestjs/config'
import { In, IsNull, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { WalletType } from '@app/src/users/payment-method/enums'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { USER_WITHDRAWAL_STATUS } from '@app/src/users/withdrawal/enums'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { POINTS_REASON, POINTS_STATUS } from '@app/src/users/points/enums'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { TransactionCategory } from '@app/src/users/wallet-transaction-history/enums'
import { TransactionFlowIndicator } from '@app/src/users/wallet-transaction-history/enums'
import { WalletHistoryTransactionType } from '@app/src/users/wallet-transaction-history/enums'
import { createUniqueId, uuidFromUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { UserWithdrawalEntity } from '@app/src/users/withdrawal/entities/user-withdrawal.entity'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { UserWithdrawalPointMapEntity } from '@app/src/users/withdrawal/entities/user-withdrawal-point-map.entity'
import { WalletTransactionHistoryService } from '@app/src/users/wallet-transaction-history/wallet-transaction-history.service'
import {
  RevertWithdrawalRequestDto,
  ConfirmWithdrawalRequestDto,
  InitiateWithdrawalRequestDto,
  UpdateWithdrawalRequestHashDto,
} from './dto'

@Injectable()
export class UserWithdrawalRequestService {
  private unlockDuration: number

  constructor(
    @InjectRepository(UserWithdrawalEntity)
    private readonly userWithdrawRepository: Repository<UserWithdrawalEntity>,
    @InjectRepository(UserWithdrawalPointMapEntity)
    private readonly userWithdrawPointMapRepository: Repository<UserWithdrawalPointMapEntity>,
    @InjectRepository(UserPointUpdatesEntity)
    protected readonly userPointUpdatesRepository: Repository<UserPointUpdatesEntity>,
    @InjectRepository(UserPointsEntity)
    protected readonly userPointsRepository: Repository<UserPointsEntity>,
    private readonly userPointsService: UserPointsService,
    private readonly configService: ConfigService,
    private readonly blockchainService: BlockchainService,
    private readonly tokensService: TokensService,
    private readonly walletTransactionHistoryService: WalletTransactionHistoryService,
  ) {
    const duration = parseInt(this.configService.get('app.withdrawUnlockDuration'))
    this.unlockDuration = duration * 60 * 1000
  }

  getUnlockTime() {
    return new Date(new Date().getTime() + this.unlockDuration)
  }

  async initiateRequest(userId: string, payload: InitiateWithdrawalRequestDto): Promise<SuccessRO> {
    //  1. Verify if a withdrawal is already initiated
    const existingWithdrawal = await this.userWithdrawRepository.findOne({
      where: {
        user: { id: userId },
        status: In([
          USER_WITHDRAWAL_STATUS.INITIATED,
          USER_WITHDRAWAL_STATUS.LOCKED,
          USER_WITHDRAWAL_STATUS.UNLOCKED,
          USER_WITHDRAWAL_STATUS.WITHDRAWING,
        ]),
      },
    })

    if (existingWithdrawal) throw new BadRequestException(ErrorKey.WITHDRAWAL_ALREADY_EXISTS)

    //  2. Get token details
    const token = await this.tokensService.getTokenInfo(payload.currency)

    //  3. Verify if user has enough points
    const withdrawAmount = BigNumber(payload.amount)
    const availablePoints = await this.userPointsService.getAvailablePoints(userId, token.id)
    if (availablePoints.isLessThan(withdrawAmount))
      throw new BadRequestException(ErrorKey.INSUFFICIENT_POINTS)

    //  4. Get points which can be withdrawn
    const withdrawablePoints = await this.userPointsService.getWithdrawablePoints(
      userId,
      token.id,
      withdrawAmount,
    )

    //  5. Loop over the points to create updates and mappings
    let totalRemaining: BigNumber = withdrawAmount
    const pointMaps: UserWithdrawalPointMapEntity[] = []
    const pointUpdates: UserPointUpdatesEntity[] = []

    for (const point of withdrawablePoints) {
      //  5.1. Calculate the points to deduct
      const toDeduct = totalRemaining.isLessThanOrEqualTo(point.remaining)
        ? totalRemaining
        : point.remaining

      //  5.2. Deduct the amount from total
      totalRemaining = totalRemaining.minus(toDeduct)

      //  5.3. Update the Point entry
      point.status = POINTS_STATUS.AWAITING_WITHDRAWAL
      point.remaining = point.remaining.minus(toDeduct)

      //  5.4. Create the DB entries for Point Mappings and point updates
      pointMaps.push(
        this.userWithdrawPointMapRepository.create({
          point: point,
          amount: toDeduct,
          status: USER_WITHDRAWAL_STATUS.INITIATED,
        }),
      )

      pointUpdates.push(
        this.userPointUpdatesRepository.create({
          user_point: point,
          status: POINTS_STATUS.AWAITING_WITHDRAWAL,
          notes: {
            amount: payload.amount,
            reason: POINTS_REASON.REDEEM,
          },
        }),
      )

      //  5.5. Stop the loop when total is reached
      if (totalRemaining.isLessThanOrEqualTo(point.remaining)) break
    }

    //  5. Create the Withdrawal Entry
    const withdrawal = await this.userWithdrawRepository.save({
      user: {
        id: userId,
      },
      amount: payload.amount,
      currency: {
        id: token.id,
      },
      unlockTime: this.getUnlockTime(),
      status: USER_WITHDRAWAL_STATUS.INITIATED,
      pointsMap: pointMaps,
    })

    const withdrawalDetails = await this.userWithdrawRepository.findOne({
      where: {
        id: withdrawal.id,
      },
      relations: {
        user: {
          wallets: true,
        },
        currency: true,
      },
    })

    //  6. Bulk update the Point updates
    await this.userPointUpdatesRepository.save(pointUpdates)

    //  7. Generate Signature
    const userSmartAccount = withdrawalDetails.user.wallets.find(
      (wallet) => wallet.is_internal && wallet.type === WalletType.SMART_ACCOUNT,
    )
    const signature = await this.blockchainService.signUserWithdrawal(
      {
        user: userSmartAccount.address,
        token: withdrawalDetails.currency.address,
        amount: withdrawAmount,
        withdrawId: createUniqueId(withdrawal.id),
      },
      withdrawalDetails.currency.decimals,
    )

    return {
      success: true,
      message: 'Withdrawal Request initiated successfully',
      data: {
        ...signature.withdrawal,
        sign: signature.sign,
        transactionId: withdrawal.id,
      },
    }
  }

  async revertRequest(userId: string, payload: RevertWithdrawalRequestDto): Promise<SuccessRO> {
    //  1. Validate the withdrawal exists and is in correct state
    const existingWithdrawal = await this.userWithdrawRepository.findOne({
      where: {
        id: payload.withdraw,
        user: {
          id: userId,
        },
        status: USER_WITHDRAWAL_STATUS.INITIATED,
      },
      relations: [Query.POINTS_MAP, `${Query.POINTS_MAP}.${Query.POINT}`],
    })
    if (!existingWithdrawal) {
      console.error(ErrorKey.WITHDRAWAL_NOT_FOUND, userId, payload)
      throw new NotFoundException(ErrorKey.WITHDRAWAL_NOT_FOUND)
    }

    //  2. Verify the Transaction is Reverted on Blockchain
    try {
      const blockchainVerified = await this.blockchainService.isTransactionReverted(
        existingWithdrawal.transaction_hash,
      )
      if (!blockchainVerified) throw new BadRequestException(ErrorKey.TRANSACTION_NOT_REVERTED)
    } catch (err) {
      throw new BadRequestException(ErrorKey.TRANSACTION_HASH_INVALID)
    }

    //  3. Create the updates
    const pointUpdates: UserPointUpdatesEntity[] = []
    for (const map of existingWithdrawal.points_map) {
      //  3.1. Revert the remaining amount for the point
      map.point.remaining = map.point.remaining.plus(map.amount)
      map.status = USER_WITHDRAWAL_STATUS.REVERTED

      // ToDo: Calculate after locking the points and do in an SQL query
      //  3.2. Calculate the new status for the point
      const pointsUsedBy = await this.userWithdrawPointMapRepository
        .createQueryBuilder('map')
        .select('COUNT(*)', 'count')
        .where('map.status IN (:...status)', {
          status: [USER_WITHDRAWAL_STATUS.INITIATED, USER_WITHDRAWAL_STATUS.LOCKED],
        })
        .andWhereInIds([map.point.id])
        .getRawOne()
      let newStatus = POINTS_STATUS.AWAITING_WITHDRAWAL
      if (parseInt(pointsUsedBy.count) === 1) {
        newStatus = map.point.remaining.isEqualTo(map.point.amount)
          ? POINTS_STATUS.DELIVERED
          : POINTS_STATUS.PARTIALLY_REDEEMED
      }

      //  3.3. Update the status of the point and create update entry
      map.point.status = newStatus
      pointUpdates.push(
        this.userPointUpdatesRepository.create({
          user_point: map.point,
          status: newStatus,
          notes: {
            ...(map.point.updates.at(-1).notes || {}),
            reason: POINTS_REASON.REDEEM_REVERT,
          },
        }),
      )
    }

    //  4. Update the Withdrawal, mapping, and create the point updates
    existingWithdrawal.status = USER_WITHDRAWAL_STATUS.REVERTED
    await existingWithdrawal.save()
    await this.userPointUpdatesRepository.save(pointUpdates)

    return {
      success: true,
      message: 'Withdrawal Request reverted successfully',
      data: payload,
    }
  }

  async confirmRequest(payload: ConfirmWithdrawalRequestDto): Promise<SuccessRO> {
    //  1. Validate the withdrawal exists and is in correct state
    const existingWithdrawal = await this.userWithdrawRepository.findOne({
      where: {
        id: uuidFromUniqueId(payload.withdraw_id),
        status: USER_WITHDRAWAL_STATUS.INITIATED,
      },
      relations: [Query.POINTS_MAP, `${Query.POINTS_MAP}.${Query.POINT}`],
    })

    if (!existingWithdrawal) {
      console.error(ErrorKey.WITHDRAWAL_NOT_FOUND, payload)
      throw new NotFoundException(ErrorKey.WITHDRAWAL_NOT_FOUND)
    }

    //  2. Update the status as Locked
    for (const map of existingWithdrawal.points_map) {
      map.status = USER_WITHDRAWAL_STATUS.LOCKED
    }

    existingWithdrawal.status = USER_WITHDRAWAL_STATUS.LOCKED
    existingWithdrawal.unlock_time = new Date(payload.unlock_time * 1000)

    existingWithdrawal.save()

    // 3. Log the Withdrawal Request
    await this.walletTransactionHistoryService.historyRepository.save({
      owner_user: existingWithdrawal.user,
      transaction_timestamp: new Date(),
      transaction_type: WalletHistoryTransactionType.POINTS_EXCHANGED_FOR_TOKENS,
      transaction_category: TransactionCategory.POINTS,
      flow_indicator: TransactionFlowIndicator.CREDIT,
      transaction_hash: existingWithdrawal.transaction_hash,
      fee_amount: 0,
      fee_currency: existingWithdrawal.currency,
      is_point_exchange: true,
      points: existingWithdrawal.amount.toNumber(),
      currency: existingWithdrawal.currency,
    })

    return {
      success: true,
      message: 'Withdrawal Request confirmed successfully',
      data: payload,
    }
  }

  async updateTransactionHash(
    userId: string,
    payload: UpdateWithdrawalRequestHashDto,
  ): Promise<SuccessRO> {
    //  1. Verify that withdrawal belongs to user and doesn't have a Transaction Hash
    const existingWithdrawal = await this.userWithdrawRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        id: payload.withdraw,
        transaction_hash: IsNull(),
      },
    })
    if (!existingWithdrawal) throw new NotFoundException(ErrorKey.WITHDRAWAL_NOT_FOUND)

    //  2. Update the Transaction Hash
    existingWithdrawal.transaction_hash = payload.transaction_hash
    await existingWithdrawal.save()

    return {
      message: 'Transaction Hash updated successfully',
      success: true,
      data: payload,
    }
  }
}
