import { Status } from '@app/src/shared/enums'

export enum CouponStatus {
  DRAFT = Status.DRAFT,
  ENABLED = Status.ENABLED,
  DELETED = Status.DELETED,
  EXPIRED = Status.EXPIRED,
  DISABLED = Status.DISABLED,
  SCHEDULED = Status.SCHEDULED,
}
