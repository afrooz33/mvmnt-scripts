import { HistoryEntity } from '@app/src/admin/donation-projects/history/entities/history.entity'
import { HistoryStatus } from '@app/src/admin/donation-projects/history/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DonationProjectStatus, PostingStatus } from '@app/src/nonprofit/donation-projects/enums'

/**
 * function will process all donation project created by nonprofit user
 * put back their original status from history table and update history status with ACTIVATED status
 *
 * @param userId user id
 * @returns Promise<void>
 */
export default async function (userId: string): Promise<void> {
  const donationProjects: DonationProjectEntity[] = await this.getDonationProjects(userId)

  await Promise.all(
    donationProjects.map(async (donationProject: DonationProjectEntity) => {
      const history: HistoryEntity = await this.historyRepository.findOne({
        where: {
          donation_projects: {
            id: donationProject.id,
          },
          status: HistoryStatus.AWAITING_ACTIVATION,
        },
      })

      if (!history) {
        return
      }

      donationProject.status = history.donation_project_status

      /**
       * if donation project is scheduled and date is less than current date
       * then set donation project status to PUBLISHED
       */
      if (
        donationProject.is_schedule === PostingStatus.ENABLED &&
        new Date() > new Date(donationProject.schedule_date)
      ) {
        donationProject.status = DonationProjectStatus.PUBLISHED
      }

      /**
       * if donation project deadline is enabled and deadline date is less than current date
       * then set donation project status to ENDED
       */
      if (
        donationProject.is_deadline_enabled === PostingStatus.ENABLED &&
        new Date() > new Date(donationProject.deadline_date)
      ) {
        donationProject.status = DonationProjectStatus.ENDED
      }

      await donationProject.save()

      history.status = HistoryStatus.ACTIVATED
      await history.save()
    }),
  )
}
