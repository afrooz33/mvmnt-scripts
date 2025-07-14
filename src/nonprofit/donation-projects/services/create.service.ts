import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { GetDonatedUserNotificationSettingQuery } from '@app/src/shared/sql'
import {
  AllowedDonationProjectStatus,
  DonationProjectReviewStatus,
  PostingStatus,
} from '@app/src/nonprofit/donation-projects/enums'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { NonprofitProfileStatus } from '@app/src/nonprofit/profile/enums'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { DonationProjectDto } from '@app/src/nonprofit/donation-projects/dto/donation-project.dto'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

export default async function (payload: DonationProjectDto, userId: string): Promise<SuccessRO> {
  const nonprofit: NonprofitProfileEntity = await this.nonprofitProfileService.documentExists({
    condition: [
      {
        where: {
          user: {
            id: userId,
            account_status: AccountStatus.ACTIVE,
          },
          status: NonprofitProfileStatus.APPROVED,
        },
      },
    ],
    errorMessage: ErrorKey.NONPROFIT_PROFILE_NOT_FOUND,
  })

  if (
    payload.is_schedule === PostingStatus.ENABLED &&
    payload.status === AllowedDonationProjectStatus.REVIEW
  ) {
    payload.status = AllowedDonationProjectStatus.SCHEDULED
    payload.review_status = DonationProjectReviewStatus.REVIEW
  } else if (
    payload.is_schedule === PostingStatus.ENABLED &&
    payload.status === AllowedDonationProjectStatus.DRAFT
  ) {
    payload.status = AllowedDonationProjectStatus.DRAFT
  } else if (payload.status === AllowedDonationProjectStatus.REVIEW) {
    payload.review_status = DonationProjectReviewStatus.REVIEW
  }

  if (!payload.donation_presets && nonprofit.donation_presets) {
    payload.donation_presets = nonprofit.donation_presets
    payload.default_donation_preset_amount = nonprofit.default_donation_preset_amount ?? 0
  }

  const images: ImagesEntity[] = await this.imagesService.getImages(payload.images)
  const tags: TagEntity[] = await this.tagsService.getTags(payload.tags)

  const display_order = await this.getDisplayOrderCount({
    where: {
      user: {
        id: userId,
      },
    },
  })

  const donationProject: DonationProjectEntity = await this.updateOne({
    ...payload,
    display_order,
    user: userId,
    images,
    tags,
  })

  if (donationProject.schedule_date && payload.status === AllowedDonationProjectStatus.SCHEDULED) {
    const schedule_date: any = new Date(donationProject.schedule_date)
    const currentDate: any = new Date()
    const name = `Publish donation project [${donationProject.id}]`

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

  const donatedUsers = await this.donationRepository.query(
    GetDonatedUserNotificationSettingQuery(userId),
  )

  if (donatedUsers.length) {
    const notificationContent = {
      title: `${nonprofit?.first_name} ${nonprofit?.last_name} which was donated in the past has added a new donation project`,
      type: NotificationType.NONPROFIT_ADD_DONATION_PROJECT,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.NONPROFIT,
      data: {
        nonprofitId: userId,
        resource: donationProject.id,
        name: donationProject.name,
      },
    }

    for (const user of donatedUsers) {
      await this.notificationsService.create({
        ...notificationContent,
        user: user.id,
      })
    }
  }

  return {
    success: true,
    message: `Donation project [${donationProject.id}] successfully saved`,
    data: donationProject,
  }
}
