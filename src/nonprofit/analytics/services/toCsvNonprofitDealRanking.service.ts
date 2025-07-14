import { DealStatus } from '@app/src/users/deal/enums'
import { UserAccountType } from '@app/src/users/user/enums'
import { ICsvNonprofitDealRanking } from '@app/src/shared/interfaces'

export default function (ranking: any): ICsvNonprofitDealRanking {
  return {
    'Deal id': ranking.deal_id,
    'Deal name': ranking.deal_name,
    'Deal type': ranking.deal_deal_type,
    'Deal start date': ranking.deal_start_date,
    'Deal end date': ranking.deal_end_date,
    'Deal status': DealStatus[ranking.deal_status],
    'Seller username': ranking.user_username,
    Name: ranking.user_display_name,
    'Seller account type': UserAccountType[ranking.user_account_type],
    'Total donations': ranking.total_donation,
    'Total sales': ranking.total_sales,
  }
}
