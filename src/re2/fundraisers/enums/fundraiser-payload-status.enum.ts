import { FundraiserStatus } from './fundraiser-status.enum'

export enum FundraiserPayloadStatus {
  DRAFT = FundraiserStatus.DRAFT,
  HIDDEN = FundraiserStatus.HIDDEN,
  PREVIEW = FundraiserStatus.PREVIEW,
  ENABLED = FundraiserStatus.ENABLED,
  DISABLED = FundraiserStatus.DISABLED,
  ON_REVIEW = FundraiserStatus.ON_REVIEW,
}
