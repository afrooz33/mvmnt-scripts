import { ICsvDeals } from '@app/src/shared/interfaces'
import { DealType } from '@app/src/users/deal/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

export default function (deal: DealEntity): ICsvDeals {
  return {
    Name: deal.name,
    User: deal.user?.display_name,
    'Deal type': DealType[deal.deal_type],
    Description: deal.description,
    'Start date': deal.start_date,
    'End date': deal.end_date,
    'Total bids': deal.total_bids,
    'Total sales': deal.total_sales,
    Participant: deal.participants,
    'Current bid': deal.current_bid,
    'Gross donation': deal.total_donation,
    'Net donation': deal.net_donation,
    'Buynow purchase': deal.total_sales,
  }
}
