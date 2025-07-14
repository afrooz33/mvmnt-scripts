import { In } from 'typeorm'
import { ErrorKey, Status } from '@app/src/shared/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

export default async function (ids: string[], user: string): Promise<DonationProjectEntity[]> {
  const donationProject: DonationProjectEntity[] = await Promise.all(
    ids.map(async (id) => {
      return await this.documentExists({
        condition: [
          {
            where: {
              id,
              user: {
                id: user,
              },
              status: In([Status.ENDED, Status.TO_BE_CANCELLED, Status.PUBLISHED]),
            },
          },
        ],
        errorMessage: JSON.stringify({
          key: ErrorKey.DONATION_PROJECT_NOT_FOUND,
          args: { id },
        }),
      })
    }),
  )

  return donationProject
}
