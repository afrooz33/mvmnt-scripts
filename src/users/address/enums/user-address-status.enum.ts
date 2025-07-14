import { Status } from '@app/src/shared/enums'

export enum UserAddressStatus {
  REVIEW = Status.REVIEW,
  ENABLED = Status.ENABLED,
  DELETED = Status.DELETED,
  DISABLED = Status.DISABLED,
  DECLINED = Status.DECLINED,
  SYSTEM_DEFAULT = Status.SYSTEM_DEFAULT,
}
