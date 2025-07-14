import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BanDto } from '@app/src/admin/deals/dto'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'

export default async function (id: string, payload: BanDto): Promise<SuccessRO> {
  try {
    const deal = await this.documentExists({
      condition: [
        {
          where: {
            id,
            status: In([DealStatus.ON_DEAL, DealStatus.SCHEDULED]),
          },
          relations: [Query.USER],
          select: ['id', 'deal_type', 'status', 'name', 'user'],
        },
      ],
      errorMessage: ErrorKey.DEAL_NOT_FOUND,
    })

    const name = `Publish user deal [${deal.id}]`

    const existingTask = await this.taskSchedulerService.findOne({
      where: {
        name,
        status: TaskScheduleStatus.PENDING,
      },
    })

    if (existingTask) {
      const jobToRemove = await this.dealQueue.getJob(existingTask.job_id)

      await jobToRemove?.remove()

      existingTask.status = TaskScheduleStatus.DELETED

      await this.taskSchedulerService.updateOne(existingTask)
    }

    deal.status = DealStatus.SUSPENDED
    deal.admin_memo = payload.admin_memo

    await deal.save()

    //removed await so UI will get response faster and process continue in backgroud
    if (deal.deal_type === DealType.AUCTION) {
      this.suspendAuctionMethod(deal)
    }

    if (deal.deal_type === DealType.RAFFLE) {
      this.suspendRaffleMethod(deal)
    }

    if (deal.deal_type === DealType.BUYNOW) {
      this.suspendBuynowMethod(deal)
    }

    return {
      success: true,
      message: 'Deal has been suspended successfully.',
      data: deal,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
