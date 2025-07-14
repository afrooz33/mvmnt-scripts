import { ReturnHistoryQueryDto } from '@app/src/purchase-history/refund-exchange/dto'
import {
  ReturnExchangeType,
  ReturnExchangeStatus,
  ReturnExchangeLogAction,
} from '@app/src/purchase-history/refund-exchange/enums'

export default async function (query: ReturnHistoryQueryDto, userId: string): Promise<any[]> {
  let whereCondition = {}

  // Create appropriate filter conditions based on parameters
  if (query.cart && query.cart_item) {
    whereCondition = {
      return_exchange: {
        cart: { id: query.cart },
        buyer: { id: userId },
      },
    }
  } else if (query.bid) {
    whereCondition = {
      return_exchange: {
        bid: { id: query.bid },
        buyer: { id: userId },
      },
    }
  } else {
    return []
  }

  // Fetch logs with the appropriate filters
  const logs = await this.returnExchangeLogRepository.find({
    where: whereCondition,
    relations: ['return_exchange'],
    order: { timestamp: 'ASC' },
  })

  const history: any[] = []

  // Group by return_exchange ID
  const groupedLogs: Record<string, any[]> = {}
  for (const log of logs) {
    if (!groupedLogs[log.return_exchange.id]) {
      groupedLogs[log.return_exchange.id] = []
    }
    groupedLogs[log.return_exchange.id].push(log)
  }

  // Process each group of logs (each return/exchange request)
  for (const returnExchangeId in groupedLogs) {
    if (!groupedLogs.hasOwnProperty(returnExchangeId)) continue
    const logsForExchange = groupedLogs[returnExchangeId]

    // Initialize state trackers for THIS return_exchange
    let requestedReturnQuantity = 0
    let requestedExchangeQuantity = 0
    let approvedReturnQuantity = 0
    let approvedExchangeQuantity = 0
    let declinedReturnQuantity = 0
    let declinedExchangeQuantity = 0

    const underReviewLogs: any[] = []
    const approvedLogs: any[] = []
    const declinedLogs: any[] = []

    // Process logs chronologically
    for (const log of logsForExchange) {
      if (log.action === ReturnExchangeLogAction.REQUEST_CREATED) {
        const reqType = log.details.type
        // When filtering by bid, we don't need to check cart_item
        const quantity = query.cart_item
          ? log.details.items.reduce((acc, item) => {
              if (item.item_id === query.cart_item) {
                return acc + (item.quantity_requested ?? 0)
              }
              return acc
            }, 0)
          : log.details.items.reduce((acc, item) => acc + (item.quantity_requested ?? 0), 0)

        if (reqType === ReturnExchangeType.RETURN) {
          requestedReturnQuantity += quantity
        } else {
          requestedExchangeQuantity += quantity
        }
        underReviewLogs.push(log) // Add to under review logs
      } else if (log.action === ReturnExchangeLogAction.STATUS_UPDATED) {
        for (const itemUpdate of log.details.items) {
          // Skip if cart_item filter is present and doesn't match
          if (query.cart_item && itemUpdate.item_id !== query.cart_item) continue

          if (
            itemUpdate.new_status === ReturnExchangeStatus.APPROVED ||
            itemUpdate.new_status === ReturnExchangeStatus.PARTIALLY_APPROVED
          ) {
            if (log.return_exchange.type === ReturnExchangeType.RETURN) {
              approvedReturnQuantity += itemUpdate.approved_quantity ?? 0
            } else {
              approvedExchangeQuantity += itemUpdate.approved_quantity ?? 0
            }
            approvedLogs.push(log)
          } else if (itemUpdate.new_status === ReturnExchangeStatus.REJECTED) {
            if (log.return_exchange.type === ReturnExchangeType.RETURN) {
              declinedReturnQuantity +=
                (itemUpdate.quantity_requested ?? 0) - (itemUpdate.approved_quantity ?? 0)
            } else {
              declinedExchangeQuantity +=
                (itemUpdate.quantity_requested ?? 0) - (itemUpdate.approved_quantity ?? 0)
            }
            declinedLogs.push(log)
          }
        }
      }
    }

    // Create history entries based on accumulated states
    const createHistoryEntry = (
      label: string,
      date: Date,
      data: any[],
      allReview: boolean,
      allApprove: boolean,
      allRejected: boolean,
    ) => {
      history.push({
        label,
        date,
        data,
        all_review: allReview,
        all_approve: allApprove,
        all_rejected: allRejected,
      })
    }

    // Determine final status for THIS return_exchange (after processing all logs)
    const allReturnedApproved =
      requestedReturnQuantity > 0 && approvedReturnQuantity >= requestedReturnQuantity
    const allExchangedApproved =
      requestedExchangeQuantity > 0 && approvedExchangeQuantity >= requestedExchangeQuantity
    const allReturnedDeclined =
      requestedReturnQuantity > 0 &&
      declinedReturnQuantity >= requestedReturnQuantity - approvedReturnQuantity
    const allExchangedDeclined =
      requestedExchangeQuantity > 0 &&
      declinedExchangeQuantity >= requestedExchangeQuantity - approvedExchangeQuantity

    if (allReturnedApproved) {
      createHistoryEntry(
        'ALL_APPROVE',
        approvedLogs[approvedLogs.length - 1]?.timestamp,
        approvedLogs,
        false,
        true,
        false,
      )
    } else if (allExchangedApproved) {
      createHistoryEntry(
        'ALL_APPROVE',
        approvedLogs[approvedLogs.length - 1]?.timestamp,
        approvedLogs,
        false,
        true,
        false,
      )
    } else if (allReturnedDeclined && requestedReturnQuantity > 0 && approvedReturnQuantity == 0) {
      createHistoryEntry(
        'ALL_DECLINED',
        declinedLogs[declinedLogs.length - 1]?.timestamp,
        declinedLogs,
        false,
        false,
        true,
      )
    } else if (
      allExchangedDeclined &&
      requestedExchangeQuantity > 0 &&
      approvedExchangeQuantity == 0
    ) {
      createHistoryEntry(
        'ALL_DECLINED',
        declinedLogs[declinedLogs.length - 1]?.timestamp,
        declinedLogs,
        false,
        false,
        true,
      )
    } else {
      if (requestedReturnQuantity > 0) {
        if (approvedReturnQuantity > 0 || declinedReturnQuantity > 0) {
          createHistoryEntry(
            'RETURN_REVIEW',
            approvedLogs[approvedLogs.length - 1]?.timestamp ||
              declinedLogs[declinedLogs.length - 1]?.timestamp,
            [...approvedLogs, ...declinedLogs].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            ),
            false,
            allReturnedApproved,
            allReturnedDeclined,
          )
        } else {
          //If neither approved nor rejected it means under review
          createHistoryEntry(
            'RETURN_REVIEW',
            underReviewLogs[underReviewLogs.length - 1]?.timestamp,
            underReviewLogs,
            true,
            false,
            false,
          )
        }
      }
      if (requestedExchangeQuantity > 0) {
        if (approvedExchangeQuantity > 0 || declinedExchangeQuantity > 0) {
          createHistoryEntry(
            'EXCHANGE_REVIEW',
            approvedLogs[approvedLogs.length - 1]?.timestamp ||
              declinedLogs[declinedLogs.length - 1]?.timestamp,
            [...approvedLogs, ...declinedLogs].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
            ),
            false,
            allExchangedApproved,
            allExchangedDeclined,
          )
        } else {
          createHistoryEntry(
            'EXCHANGE_REVIEW',
            underReviewLogs[underReviewLogs.length - 1]?.timestamp,
            underReviewLogs,
            true,
            false,
            false,
          )
        }
      }
    }
  }

  return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ensure DESC order overall
}
