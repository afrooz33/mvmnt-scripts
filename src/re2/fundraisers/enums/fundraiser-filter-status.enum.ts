import { Status } from '@app/src/shared/enums'

export enum FundraiserFilterStatus {
  ENDED = Status.ENDED,
  DRAFT = Status.DRAFT,
  HIDDEN = Status.HIDDEN,
  ENABLED = Status.ENABLED,
  DECLINED = Status.DECLINED,
  DISABLED = Status.DISABLED,
  CONFIRMED = Status.CONFIRMED,
  SUSPENDED = Status.SUSPENDED,
  PUBLISHED = Status.PUBLISHED,
  ON_REVIEW = Status.ON_REVIEW,
}
