import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { DealReviewDto } from '@app/src/admin/deals/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealStatus, DealType } from '@app/src/users/deal/enums'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default async function (payload: DealReviewDto, id: string): Promise<SuccessRO> {
  if (id !== payload.id) {
    throw new BadRequestException(ErrorKey.INVALID_PAYLOAD)
  }

  const deal: DealEntity = await this.documentExists({
    condition: [
      {
        relations: [Query.USER],
        where: {
          id,
          deal_type: DealType.RAFFLE,
        },
        select: {
          id: true,
          start_date: true,
          user: {
            id: true,
            account_status: true,
          },
        },
      },
    ],
    errorMessage: ErrorKey.DEAL_NOT_FOUND,
  })

  if (deal?.user?.account_status === AccountStatus.DELETED) {
    throw new BadRequestException(ErrorKey.USER_NOT_FOUND)
  }

  if (payload.status === DealStatus.ON_DEAL) {
    if (new Date(deal.start_date).getTime() > new Date().getTime()) {
      const existingTask = await this.taskSchedulerService.findOne({
        where: {
          name: `Publish user deal [${deal.id}]`,
          status: TaskScheduleStatus.PENDING,
        },
      })

      if (existingTask) {
        const jobToRemove = await this.dealQueue.getJob(existingTask.job_id)

        await jobToRemove?.remove()

        existingTask.status = TaskScheduleStatus.DELETED

        await this.taskSchedulerService.updateOne(existingTask)
      }

      const dealSchedule = await this.dealQueue.add(
        name,
        {
          id: deal.id,
          schedule_date: deal.start_date,
        },
        {
          delay: new Date(deal.start_date).getTime() - new Date().getTime(),
          removeOnComplete: true,
          removeOnFail: false,
        },
      )

      await this.taskSchedulerService.create({
        job_id: dealSchedule.id,
        name,
        data: dealSchedule.data,
        scheduled_at: deal.start_date,
      })
    }
  }

  deal.admin_memo = payload.admin_memo ? payload.admin_memo : null

  await this.dealRepository.save(deal)

  return {
    success: true,
    message: `Deal [${deal.id}] successfully saved`,
    data: deal.toResponseObject(),
  }
}
