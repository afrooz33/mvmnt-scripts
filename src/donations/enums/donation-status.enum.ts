import { Status } from '@app/src/shared/enums'

export enum DonationStatus {
  PENDING = Status.PENDING,
  SUCCESS = Status.SUCCESS,
  FAILED = Status.FAILED,
  REFUNDED = Status.REFUNDED,
  CANCELLED = Status.CANCELLED,
}
