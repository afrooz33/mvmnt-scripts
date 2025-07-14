import { In, Not } from 'typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'

export default async function auctionReceiptService(
  dealId: string,
  bidId: string,
  purchaseId: string,
  userId: string,
): Promise<any> {
  try {
    await this.userService.documentExists({
      condition: [
        {
          where: {
            id: userId,
            account_status: AccountStatus.ENABLED,
          },
          select: {
            id: true,
          },
        },
      ],
      errorMessage: ErrorKey.USER_NOT_FOUND,
    })

    const purchase = await this.documentExists({
      condition: [
        {
          where: {
            id: purchaseId,
            deal: {
              id: dealId,
              deal_type: DealType.AUCTION,
            },
            payment: {
              user: {
                id: userId,
              },
              bid: {
                id: bidId,
              },
            },
            status: Not(In([PAYMENT_STATUS.CANCELLED])),
          },
          select: {
            id: true,
            deal_amount: true,
            donation_amount: true,
            buyer_points: true,
            seller_points: true,
            status: true,
            gas_fees: true,
            deal: {
              id: true,
              name: true,
            },
            payment: {
              id: true,
              transaction_hash: true,
              bid: {
                id: true,
                address: {
                  id: true,
                  state: true,
                  city: true,
                  street: true,
                  phone_number: true,
                  building: true,
                },
              },
            },
            donation_project: {
              id: true,
              name: true,
              status: true,
              user: {
                id: true,
                profile: {
                  id: true,
                  foundation_name: true,
                  foundation_url: true,
                  introduction: true,
                },
              },
            },
          },
          relations: [
            'deal',
            'payment',
            'payment.bid',
            'donation_project',
            'payment.bid.address',
            'donation_project.user',
            'donation_project.user.profile',
          ],
        },
      ],
      errorMessage: ErrorKey.PURCHASE_NOT_FOUND,
    })

    return purchase
  } catch (error) {
    return HandleErrors(error)
  }
}
