import { Status } from '@app/src/shared/enums'

export enum AccountStatus {
  ACTIVE = Status.ACTIVE,
  DEACTIVATED = Status.DEACTIVATED,
  DELETED = Status.DELETED,
  BLOCKED = Status.BLOCKED,
}
