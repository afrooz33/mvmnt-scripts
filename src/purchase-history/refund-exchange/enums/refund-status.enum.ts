import { Status } from '@app/src/shared/enums'

export enum RefundStatus {
  FAILED = Status.FAILED,
  PENDING = Status.PENDING,
  COMPLETED = Status.COMPLETED,
  PROCESSING = Status.PROCESSING,
}
