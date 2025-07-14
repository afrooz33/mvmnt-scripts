import { Status } from '@app/src/shared/enums'

export enum DonationProjectStatus {
  REVIEW = Status.REVIEW,
  PUBLISHED = Status.PUBLISHED,
  DECLINED = Status.DECLINED,
  SCHEDULED = Status.SCHEDULED,
  SUSPENDED = Status.SUSPENDED,
  ENDED = Status.ENDED,
  DRAFT = Status.DRAFT,
  TO_BE_CANCELLED = Status.TO_BE_CANCELLED,
  DELETED = Status.DELETED,
  DEFAULT = Status.DEFAULT,
}
