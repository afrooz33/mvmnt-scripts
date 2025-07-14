import { Status } from '@app/src/shared/enums'

export enum ResellingRewardStatus {
  PENDING = Status.PENDING,
  EXPIRED = Status.EXPIRED,
  REJECTED = Status.REJECTED,
  REDEEMED = Status.REDEEMED,
  ACQUIRED = Status.ACQUIRED,
  CANCELLED = Status.CANCELLED,
  RESELLER_BANNED = Status.RESELLER_BANNED,
}
