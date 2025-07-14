import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { BidStatus } from '@app/src/users/deal/bid/enums'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'

/**
 * Suspend a deal and notify relevant users based on their bid status.
 *
 * @param {Object} deal - The deal object containing deal details.
 */
export default async function (deal) {
  try {
    const bids = await fetchDealUsers.call(this, deal.id)

    if (!bids.length) return

    const winnerWithNoPayment = await fetchDealUsers.call(this, deal.id, [BidStatus.AWARDED])

    const winnerWithPayment = await fetchDealUsers.call(this, deal.id, [
      BidStatus.COMPLETED,
      BidStatus.WAITING_SHIPMENT,
    ])

    // Notify the appropriate user based on bid status
    if (winnerWithNoPayment.length) {
      await notifyWinner(winnerWithNoPayment[0], deal, this.notificationsService)
    } else if (winnerWithPayment.length) {
      await notifyWinner(winnerWithPayment[0], deal, this.notificationsService)
      // TODO: Implement refund logic for the winner if applicable
    } else {
      await this.notifyParticipants(bids, deal)
    }

    // Notify the deal creator
    await this.notificationsService.create({
      title: `${deal.name} has been suspended`,
      user: deal.user.id,
      type: NotificationType.DEAL_STATUS_CHANGED,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        deal: deal.id,
        deal_name: deal.name,
        seller: deal.user.display_name,
      },
    })
  } catch (error) {
    return HandleErrors(error)
  }
}

/**
 * Notify the winner of the deal.
 *
 * @param {Object} user - The user object of the winner.
 * @param {Object} deal - The deal object.
 * @param {Object} notificationsService - The notification service instance.
 */
async function notifyWinner(user, deal, notificationsService) {
  await notificationsService.create({
    title: 'The deal you won has been suspended by the admin.',
    user: user.id,
    type: NotificationType.DEAL_STATUS_CHANGED,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.DEAL,
    data: {
      deal: deal.id,
      deal_name: deal.name,
      seller: deal.user.display_name,
    },
  })
}

/**
 * Fetch users associated with a deal based on the provided conditions.
 *
 * @param {string} dealId - The ID of the deal.
 * @param {Array<string>} [bidStatuses] - Optional array of bid statuses to filter users.
 * @returns {Promise<Array>} - List of users associated with the deal.
 */
async function fetchDealUsers(dealId, bidStatuses = []) {
  const placeholders = bidStatuses.map((_, index) => `$${index + 2}`).join(', ')

  let query = `
    SELECT
      "users"."id",
      "users"."email",
      "users"."username"
    FROM
      "user_deal_bids"
    LEFT JOIN "users" ON "users"."id" = "user_deal_bids"."userId"
    WHERE
      "dealId" = $1`

  if (bidStatuses.length) {
    query += ` AND "status" IN (${placeholders})`
  }

  const queryParams = [dealId, ...bidStatuses]

  return await this.dealRepository.query(query, queryParams)
}
