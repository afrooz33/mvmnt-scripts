import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfirmWithdrawalConcludeDto } from './dto'
import { SuccessRO } from '@app/src/shared/dto'
import { InjectRepository } from '@nestjs/typeorm'
import { UserWithdrawalEntity } from '@app/src/users/withdrawal/entities/user-withdrawal.entity'
import { Repository } from 'typeorm'
import { USER_WITHDRAWAL_STATUS } from '@app/src/users/withdrawal/enums'
import { POINTS_REASON, POINTS_STATUS } from '@app/src/users/points/enums'
import { UserWithdrawalPointMapEntity } from '@app/src/users/withdrawal/entities/user-withdrawal-point-map.entity'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { ErrorKey } from '@app/src/shared/enums'
import { uuidFromUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import {
  NotificationReceiverType,
  NotificationRelatedTo,
  NotificationType,
} from '@app/src/notifications/enums'

@Injectable()
export class UserWithdrawalConcludeService {
  constructor(
    @InjectRepository(UserWithdrawalEntity)
    protected readonly userWithdrawalRepository: Repository<UserWithdrawalEntity>,
    @InjectRepository(UserWithdrawalPointMapEntity)
    protected readonly userWithdrawPointMapRepository: Repository<UserWithdrawalPointMapEntity>,
    @InjectRepository(UserPointUpdatesEntity)
    protected readonly userPointUpdatesRepository: Repository<UserPointUpdatesEntity>,
    @InjectRepository(NotificationEntity)
    protected readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  confirmConclude = async (payload: ConfirmWithdrawalConcludeDto): Promise<SuccessRO> => {
    //  1. Verify the Withdrawal
    const existingWithdrawal = await this.userWithdrawalRepository.findOne({
      where: {
        id: uuidFromUniqueId(payload.withdraw_id),
        status: USER_WITHDRAWAL_STATUS.UNLOCKED,
      },
      relations: {
        points_map: {
          point: true,
        },
        user: true,
      },
    })
    if (!existingWithdrawal) {
      throw new NotFoundException(ErrorKey.WITHDRAWAL_NOT_FOUND)
    }

    //  2. Prepare data for update
    const pointUpdates: UserPointUpdatesEntity[] = []
    for (const map of existingWithdrawal.points_map) {
      //  2.1. Decide the status of Points
      let newStatus = POINTS_STATUS.REDEEMED
      if (!map.point.remaining.isEqualTo(0)) {
        const pointsUsedBy = await this.userWithdrawPointMapRepository
          .createQueryBuilder('map')
          .select('COUNT(*)', 'count')
          .where('map.status IN (:...status)', {
            status: [USER_WITHDRAWAL_STATUS.INITIATED, USER_WITHDRAWAL_STATUS.LOCKED],
          })
          .andWhereInIds([map.point.id])
          .getRawOne()
        if (parseInt(pointsUsedBy.count) === 1) {
          newStatus = POINTS_STATUS.PARTIALLY_REDEEMED
        }
      }

      //  2.2.Set the status of points and the point map
      map.point.status = newStatus
      map.status = USER_WITHDRAWAL_STATUS.COMPLETED

      //  2.3. Create entry for Point updates
      pointUpdates.push(
        this.userPointUpdatesRepository.create({
          user_point: map.point,
          status: newStatus,
          notes: {
            ...(map.point.updates.at(-1).notes || {}),
            reason: POINTS_REASON.REDEEM_COMPLETE,
          },
        }),
      )
    }

    //  3. Update the status of the Withdrawal and point updates
    existingWithdrawal.status = USER_WITHDRAWAL_STATUS.COMPLETED
    existingWithdrawal.save()
    await this.userPointUpdatesRepository.save(pointUpdates)

    const notification = this.notificationRepository.create({
      title: 'Request for balance withdrawl approved',
      user: {
        id: existingWithdrawal.user.id,
      },
      type: NotificationType.BALANCE_WITHDRAWAL_REQUEST_DONE,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.SERVICE,
      data: {
        redeem: existingWithdrawal.id,
        amount: existingWithdrawal.amount,
        username: existingWithdrawal.user.username,
      },
    })

    await notification.save()

    return {
      data: payload,
      success: true,
      message: 'Withdrawal confirmed successfully',
    }
  }
}
