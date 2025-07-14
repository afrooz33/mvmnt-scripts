import { In, Not } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { UpdateDonationProjectDto } from '@app/src/nonprofit/donation-projects/dto/update-donation-project.dto'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import {
  AllowedDonationProjectStatus,
  DonationProjectStatus,
} from '@app/src/nonprofit/donation-projects/enums'
import { TaskScheduleStatus } from '@app/src/task-scheduler/enums'

export default async function (
  id: string,
  payload: UpdateDonationProjectDto,
  userId: string,
): Promise<SuccessRO> {
  const existingDonationProject: DonationProjectEntity = await this.documentExists({
    condition: [
      {
        where: {
          id,
          user: In([userId]),
          status: Not(In([Status.ENDED, Status.TO_BE_CANCELLED, Status.SUSPENDED])),
        },
        errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
      },
    ],
  })

  if (
    existingDonationProject.status === DonationProjectStatus.PUBLISHED &&
    payload.status === AllowedDonationProjectStatus.DRAFT
  ) {
    throw new BadRequestException(ErrorKey.CANNOT_EDIT_PUBLISHED_DONATION_PROJECT)
  }

  const images: ImagesEntity[] = await this.imagesService.getImages(payload.images)
  const tags: TagEntity[] = await this.tagsService.getTags(payload.tags)

  const donationProject: DonationProjectEntity = await this.updateOne({
    ...payload,
    images,
    tags,
  })

  if (donationProject.schedule_date && payload.status === AllowedDonationProjectStatus.SCHEDULED) {
    const name = `Publish donation project [${donationProject.id}]`

    const existingTask = await this.taskSchedulerService.findOne({
      where: {
        name,
        status: TaskScheduleStatus.PENDING,
      },
    })

    if (existingTask) {
      const jobToRemove = await this.donationProjectQueue.getJob(existingTask.job_id)

      await jobToRemove?.remove()

      existingTask.status = TaskScheduleStatus.DELETED

      await this.taskSchedulerService.updateOne(existingTask)
    }

    const schedule_date: any = new Date(donationProject.schedule_date)
    const currentDate: any = new Date()

    const donationProjectSchedule = await this.donationProjectQueue.add(
      name,
      {
        id: donationProject.id,
        schedule_date: donationProject.schedule_date,
      },
      {
        delay: schedule_date - currentDate,
        removeOnComplete: true,
        removeOnFail: false,
      },
    )

    await this.taskSchedulerService.create({
      job_id: donationProjectSchedule.id,
      name,
      data: donationProjectSchedule.data,
      scheduled_at: donationProject.schedule_date,
    })
  }

  return {
    success: true,
    message: `Donation project [${donationProject.id}] successfully saved`,
    data: donationProject,
  }
}
