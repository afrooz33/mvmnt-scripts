import { Status } from '@app/src/shared/enums'

export enum FundraiserStatus {
  ENDED = Status.ENDED,
  DRAFT = Status.DRAFT,
  HIDDEN = Status.HIDDEN,
  ENABLED = Status.ENABLED,
  PREVIEW = Status.PREVIEW,
  DELETED = Status.DELETED,
  DECLINED = Status.DECLINED,
  DISABLED = Status.DISABLED,
  CONFIRMED = Status.CONFIRMED,
  SUSPENDED = Status.SUSPENDED,
  PUBLISHED = Status.PUBLISHED,
  ON_REVIEW = Status.ON_REVIEW,
}
