import { In } from 'typeorm'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { IRecurringDonation } from '@app/src/donations/interfaces'

interface UserInfo {
  merkle_tree_root: any
  address: any
  id: string
  email: string
  display_name: string
  recurring_donation: string
}

/**
 * Builds the where clause for recurring donation query based on provided arguments
 */
function buildWhereClause(args: IRecurringDonation) {
  const {
    id,
    isRE2 = false,
    isDeal = false,
    isNonprofit = false,
    isFundraiser = false,
    isIntegration = false,
    isDonationProject = false,
  } = args

  const where = { is_active: true }

  if (!id) return where

  const ids = Array.isArray(id) ? id : [id]

  if (isDeal) {
    where['deal'] = In(ids)
  }
  if (isFundraiser) {
    where['fundraiser'] = In(ids)
  }
  if (isIntegration) {
    where['integration'] = In(ids)
  }
  if (isRE2) {
    where['fundraiser'] = In([id])
    where['integration'] = In([id])
  }
  if (isDonationProject) {
    where['donation_project'] = In(ids)
  }
  if (isNonprofit) {
    where['donation_project'] = { user: { id: In(ids) } }
  }

  return where
}

/**
 * Service to cancel recurring donations based on various criteria
 * @param args - Parameters to identify which recurring donations to cancel
 * @returns List of users whose recurring donations were cancelled
 */
export default async function cancelRecurringService(
  args: IRecurringDonation,
): Promise<UserInfo[]> {
  try {
    const where = buildWhereClause(args)

    const recurringDonations = await this.recurringDonationSettingsRepository.find({
      where,
      select: {
        id: true,
        user: {
          id: true,
          email: true,
          display_name: true,
        },
        merkle_tree_root: true,
        wallet: {
          address: true,
        },
      },
      relations: { user: true, wallet: true },
    })

    const users: UserInfo[] = recurringDonations.map((donation) => ({
      id: donation.user.id,
      email: donation.user.email,
      display_name: donation.user.display_name,
      recurring_donation: donation.id,
      address: donation.wallet.address,
      merkle_tree_root: donation.merkle_tree_root,
    }))

    // Call smart contract for cancelling recurring
    await this.recurringDonationsService.processUserOrResourceDeactivation(
      users.map((user) => user.address),
      users.map((user) => user.merkle_tree_root),
    )

    return users
  } catch (error) {
    return HandleErrors(error)
  }
}
