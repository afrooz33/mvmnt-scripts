import { BadRequestException } from '@nestjs/common'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { NonprofitProfileReviewDto } from '@app/src/admin/nonprofit/dto/profile-review.dto'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import {
  DonationProjectReviewStatus,
  DonationProjectStatus,
} from '@app/src/nonprofit/donation-projects/enums'
import { createUniqueId } from '@app/src/users/payment/methods/uuid.methods'

export default async function (id: string, payload: NonprofitProfileReviewDto): Promise<SuccessRO> {
  //  1. Validate if profile exists and is active
  const profile: NonprofitProfileEntity = await this.nonprofitProfileService.documentExists({
    condition: [
      {
        relations: [Query.USER],
        where: {
          id,
        },
      },
    ],
    errorMessage: JSON.stringify({
      key: ErrorKey.NONPROFIT_PROFILE_NOT_FOUND,
      args: { id },
    }),
  })

  if (profile?.user?.account_status === AccountStatus.DELETED) {
    throw new BadRequestException(`Nonprofit profile [${id}] not found`)
  }

  //  2. Update profile status
  profile.status = payload.status
  profile.admin_memo = payload.admin_memo ? payload.admin_memo : null

  await this.nonprofitProfileService.save(profile)

  //  3. Create Default Donation project if it doesn't exist
  let donationProject = await this.donationProjectRepository.findOne({
    where: {
      user: {
        id: profile.user.id,
      },
      status: DonationProjectStatus.DEFAULT,
    },
    select: ['id'],
  })

  if (!donationProject) {
    donationProject = await this.donationProjectRepository.insert({
      name: 'DEFAULT',
      introduction: 'DEFAULT',
      description: 'DEFAULT',
      review_status: DonationProjectReviewStatus.APPROVED,
      status: DonationProjectStatus.DEFAULT,
      user: {
        id: profile?.user?.id,
      },
      display_order: 0,
    })

    donationProject.id = donationProject.raw[0].id

    //  4. Create Vault for the default Donation project
    const nonprofitSmartAccount = await this.paymentWalletsService.getNonprofitSmartAccount(
      profile.user.id,
    )

    donationProject.vault_address = await this.smartContractService.createNonprofitVault(
      createUniqueId(donationProject.id),
      nonprofitSmartAccount.address,
    )

    await this.donationProjectRepository.save(donationProject)
  }

  return {
    success: true,
    message: `Nonprofit profile [${profile.id}] successfully saved`,
    data: {
      ...profile,
      default_project: donationProject.id,
    },
  }
}
