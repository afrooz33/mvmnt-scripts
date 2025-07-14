import { Status } from '@app/src/shared/enums'

export enum BidStatus {
  PENDING = Status.PENDING,
  EXPIRED = Status.EXPIRED,
  AWARDED = Status.AWARDED,
  DECLINED = Status.DECLINED,
  REJECTED = Status.REJECTED,
  COMPLETED = Status.COMPLETED,
  CANCELLED = Status.CANCELLED,
  WAITING_SHIPMENT = Status.WAITING_SHIPMENT,
}
