import { FundraiserStatus } from './fundraiser-status.enum'

export enum FundraiserChangeStatus {
  HIDDEN = FundraiserStatus.HIDDEN,
  ENABLED = FundraiserStatus.ENABLED,
  DISABLED = FundraiserStatus.DISABLED,
  PUBLISHED = FundraiserStatus.PUBLISHED,
}
