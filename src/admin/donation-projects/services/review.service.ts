import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { DonationProjectReviewDto } from '@app/src/admin/donation-projects/dto'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { DonationProjectReviewStatus } from '@app/src/nonprofit/donation-projects/enums'
import { createUniqueId } from '@app/src/users/payment/methods/uuid.methods'

export default async function (payload: DonationProjectReviewDto, id: string): Promise<SuccessRO> {
  //  1. Validate the Payload
  if (id !== payload.id) {
    throw new BadRequestException(
      `Donation project id [${id}] does not match payload id [${payload.id}]`,
    )
  }

  //  2. Validate Donation project and user exists
  const donationProject: DonationProjectEntity = await this.documentExists({
    condition: [
      {
        relations: [Query.USER],
        where: {
          id,
          review_status: DonationProjectReviewStatus.REVIEW,
        },
      },
    ],
    errorMessage: ErrorKey.DONATION_PROJECT_NOT_FOUND,
  })

  if (donationProject?.user?.account_status === AccountStatus.DELETED) {
    throw new BadRequestException(ErrorKey.NONPROFIT_PROFILE_NOT_FOUND)
  }

  //  3. Update the Donation Project
  donationProject.review_status = payload.review_status
  donationProject.admin_memo = payload.admin_memo ? payload.admin_memo : null

  //  4. Create Nonprofit Vault if project approved and does not have vault
  if (
    payload.review_status === DonationProjectReviewStatus.APPROVED &&
    !donationProject.vault_address
  ) {
    const nonprofitSmartAccount = await this.paymentWalletsService.getNonprofitSmartAccount(
      donationProject.user.id,
    )

    const hash = await this.smartContractService.createNonprofitVault(
      createUniqueId(donationProject.id),
      nonprofitSmartAccount.address,
    )

    donationProject.vault_address = hash
  }

  await this.donationProjectRepository.save(donationProject)

  return {
    success: true,
    message: `Donation project [${donationProject.id}] successfully saved`,
    data: donationProject.toResponseObject(),
  }
}
