import { Status } from '@app/src/shared/enums'

export enum TaskScheduleStatus {
  PENDING = Status.PENDING,
  COMPLETED = Status.COMPLETED,
  FAILED = Status.FAILED,
  DELETED = Status.DELETED,
}
