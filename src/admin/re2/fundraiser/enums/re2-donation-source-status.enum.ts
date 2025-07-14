import { Status } from '@app/src/shared/enums'

export enum Re2DonationSourceStatus {
  ENDED = Status.ENDED,
  HIDDEN = Status.HIDDEN,
  REVIEW = Status.REVIEW,
  ENABLED = Status.ENABLED,
  DISABLED = Status.DISABLED,
  DECLINED = Status.DECLINED,
  SUSPENDED = Status.SUSPENDED,
  CONFIRMED = Status.CONFIRMED,
  PUBLISHED = Status.PUBLISHED,
}
