import { HistoryEntity } from '@app/src/admin/donation-projects/history/entities/history.entity'
import { HistoryStatus } from '@app/src/admin/donation-projects/history/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'

/**
 * function will process all donation project created by nonprofit user
 * capture their current status into history table and update their status to suspended
 *
 * when history table already have donation project with AWAITING_ACTIVATION status it will ignore it,
 *
 * @param userId user id
 * @returns Promise<void>
 */
export default async function (userId: string): Promise<void> {
  const donationProjects: DonationProjectEntity[] = await this.getDonationProjects(userId)

  await Promise.all(
    donationProjects.map(async (donationProject: DonationProjectEntity) => {
      const exists: HistoryEntity = await this.findOne({
        where: {
          donation_projects: {
            id: donationProject.id,
          },
          status: HistoryStatus.AWAITING_ACTIVATION,
        },
      })

      if (exists) {
        return
      }

      const history: HistoryEntity = await this.historyRepository.create({
        donationProject,
        status: HistoryStatus.AWAITING_ACTIVATION,
        donation_project_status: donationProject.status,
      })

      await this.historyRepository.save(history)

      donationProject.status = DonationProjectStatus.SUSPENDED

      await donationProject.save()
    }),
  )
}
