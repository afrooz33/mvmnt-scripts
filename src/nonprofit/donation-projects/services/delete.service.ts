import { In, Not } from 'typeorm'
import { DateTime } from 'luxon'
import { NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { DealStatus } from '@app/src/users/deal/enums'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { DonationProjectStatus } from '@app/src/nonprofit/donation-projects/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

function formatDate(date) {
  const t = new Date(date)
  const y = t.getFullYear()
  const m = ('0' + (t.getMonth() + 1)).slice(-2)
  const d = ('0' + t.getDate()).slice(-2)

  return `${y}/${m}/${d}`
}

export default async function (id: string, userId: string): Promise<SuccessRO> {
  const donationProject: DonationProjectEntity = await this.findOne({
    where: {
      id,
      user: {
        id: userId,
      },
      status: Not(
        In([
          DonationProjectStatus.DELETED,
          DonationProjectStatus.ENDED,
          DonationProjectStatus.TO_BE_CANCELLED,
        ]),
      ),
    },
  })

  if (!donationProject) {
    throw new NotFoundException(ErrorKey.DONATION_PROJECT_NOT_FOUND)
  }

  const updatedDonationProject = {
    ...donationProject,
  }

  if (!Number(donationProject.total_deals)) {
    updatedDonationProject.status = DonationProjectStatus.DELETED
  } else if (!Number(donationProject.total_active_deals)) {
    updatedDonationProject.status = DonationProjectStatus.ENDED
  } else {
    let deadline_date: Date

    const dealEndDates = await DealEntity.createQueryBuilder('deals')
      .where('deals.donation_project = :id', { id: donationProject.id })
      .andWhere('deals.status IN(:...status)', {
        status: [DealStatus.ON_DEAL, DealStatus.SCHEDULED],
      })
      .select('MAX("deals"."end_date")', 'max_end_date')
      .groupBy('deals.donation_project')
      .getRawOne()

    if (!dealEndDates.max_end_date) {
      deadline_date = DateTime.fromISO(donationProject.deadline_date.toDateString())
        .plus({
          days: 14,
        })
        .toJSDate()
    } else if (
      new Date(dealEndDates.max_end_date) > new Date(new Date().setDate(new Date().getDate() + 14))
    ) {
      deadline_date = DateTime.now()
        .plus({
          days: 14,
        })
        .toJSDate()
    } else {
      deadline_date = new Date(
        new Date(dealEndDates.max_end_date).setDate(
          new Date(dealEndDates.max_end_date).getDate() + 2,
        ),
      )

      deadline_date = DateTime.fromISO(dealEndDates.max_end_date.toDateString())
        .plus({
          days: 2,
        })
        .toJSDate()
    }

    const deals: DealEntity[] = await this.dealService.findMany({
      where: {
        donation_project: {
          id,
        },
        status: In([DealStatus.ON_DEAL, DealStatus.SCHEDULED]),
      },
      relations: [Query.USER],
      select: ['id', 'user.email', 'user.username', 'end_date'],
    })

    const cancel_date: string = formatDate(deadline_date)

    updatedDonationProject.status = DonationProjectStatus.TO_BE_CANCELLED
    updatedDonationProject.deadline_date = deadline_date

    Promise.all(
      deals.map(async (deal) => {
        this.mailerService.donationProjectToBeCancel({
          email: deal.user.email,
          username: deal.user.username,
          project_name: donationProject.name,
          cancel_date,
        })
      }),
    )
  }

  await this.updateOne(updatedDonationProject)

  return {
    success: true,
    message: 'Donation Project deleted successfully',
  }
}
