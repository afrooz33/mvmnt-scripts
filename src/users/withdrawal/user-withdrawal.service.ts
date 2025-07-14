import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, In, Repository } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { uuidFromUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { USER_WITHDRAWAL_STATUS } from './enums'
import { UserWithdrawalEntity } from './entities/user-withdrawal.entity'
import { UserWithdrawalPointMapEntity } from './entities/user-withdrawal-point-map.entity'

@Injectable()
export class UserWithdrawalService {
  private unlockBatchSize = 1000
  private revertBatchSize = 1000
  private revertDuration: number

  constructor(
    @InjectRepository(UserWithdrawalEntity)
    private readonly userWithdrawalRepository: Repository<UserWithdrawalEntity>,
    @InjectRepository(UserWithdrawalPointMapEntity)
    private readonly userWithdrawalMapRepository: Repository<UserWithdrawalPointMapEntity>,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {
    this.revertDuration = parseInt(this.configService.get('blockchain.revertDuration'))
  }

  async getUserWithdrawals(userId: string): Promise<SuccessRO> {
    const userWithdrawals = await this.userWithdrawalRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    })

    return {
      success: true,
      message: 'User Withdrawals',
      data: userWithdrawals,
    }
  }

  async rejectWithdrawal(withdraw_id: string): Promise<SuccessRO> {
    await this.entityManager.transaction(async (transaction) => {
      await transaction.update(
        UserWithdrawalEntity,
        {
          id: uuidFromUniqueId(withdraw_id),
        },
        {
          status: USER_WITHDRAWAL_STATUS.REJECTED,
        },
      )

      await transaction.update(
        UserWithdrawalPointMapEntity,
        {
          withdrawal: {
            id: uuidFromUniqueId(withdraw_id),
          },
        },
        {
          status: USER_WITHDRAWAL_STATUS.REJECTED,
        },
      )
    })

    return {
      success: true,
      message: 'Withdrawal Rejected',
      data: withdraw_id,
    }
  }

  async unlockWithdrawals() {
    while (true) {
      const isComplete: boolean = await this.entityManager.transaction(async (transaction) => {
        //  1: Update Withdrawals
        const withdrawals = await transaction
          .createQueryBuilder()
          .update(UserWithdrawalEntity)
          .set({ status: USER_WITHDRAWAL_STATUS.UNLOCKED })
          .where(
            'id IN (SELECT id FROM user_withdrawal WHERE status = :oldStatus AND unlock_time <= :unlockTime ORDER BY created LIMIT :batchSize)',
            {
              oldStatus: USER_WITHDRAWAL_STATUS.LOCKED,
              unlockTime: new Date(),
              batchSize: this.unlockBatchSize,
            },
          )
          .returning('id')
          .execute()

        if (withdrawals.raw.length === 0) return true

        const withdrawalIds: string[] = withdrawals.raw.map(
          (withdrawal: Record<string, string>) => withdrawal.id,
        )

        //  2: Update Withdrawal Maps
        await this.userWithdrawalMapRepository.update(
          {
            withdrawal: {
              id: In(withdrawalIds),
            },
          },
          {
            status: USER_WITHDRAWAL_STATUS.UNLOCKED,
          },
        )

        if (withdrawalIds.length === this.unlockBatchSize) return false

        return true
      })

      if (isComplete) break
    }
  }

  async revertWithdrawals() {
    const expiry = new Date().getTime() - this.revertDuration * 1000

    while (true) {
      const isComplete: boolean = await this.entityManager.transaction(async (transaction) => {
        //  1: Update Withdrawals
        const withdrawals = await transaction
          .createQueryBuilder()
          .update(UserWithdrawalEntity)
          .set({ status: USER_WITHDRAWAL_STATUS.REVERTED })
          .where(
            'id IN (SELECT id FROM user_withdrawal WHERE status = :oldStatus AND created <= :expiry ORDER BY created LIMIT :batchSize)',
            {
              oldStatus: USER_WITHDRAWAL_STATUS.INITIATED,
              expiry: new Date(expiry),
              batchSize: this.revertBatchSize,
            },
          )
          .returning('id')
          .execute()

        if (withdrawals.raw.length === 0) return true

        const withdrawalIds: string[] = withdrawals.raw.map(
          (withdrawal: Record<string, string>) => withdrawal.id,
        )

        //  2: Update Withdrawal Maps
        await this.userWithdrawalMapRepository.update(
          {
            withdrawal: {
              id: In(withdrawalIds),
            },
          },
          {
            status: USER_WITHDRAWAL_STATUS.REVERTED,
          },
        )

        if (withdrawalIds.length === this.revertBatchSize) return false

        return true
      })

      if (isComplete) break
    }
  }
}
