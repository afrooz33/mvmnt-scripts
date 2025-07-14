import { Status } from '@app/src/shared/enums'

export enum AccountStatus {
  ENABLED = Status.ENABLED,
  DELETED = Status.DELETED,
  BLOCKED = Status.BLOCKED,
  DISABLED = Status.DISABLED,
  REJECTED = Status.REJECTED,
  UNDER_REVIEW = Status.UNDER_REVIEW,
}
