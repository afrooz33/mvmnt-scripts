import { UserAccountType } from '@app/src/users/user/enums'
import { ICsvRaffleWinner } from '@app/src/shared/interfaces'
import { VerificationStatus } from '@app/src/users/profile/enums'

export default function (winner: any): ICsvRaffleWinner {
  return {
    'Winner id': winner?.winner_userId,
    'Winner username': winner?.user_username,
    'Prize rank': winner?.prize_rank,
    'Prize name': winner?.prize_name,
    'Winner account type': UserAccountType[winner?.user_account_type],
    'Winner account review': VerificationStatus[winner?.user_account_review],
  }
}
