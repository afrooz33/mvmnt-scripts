import { Status } from '@app/src/shared/enums'

export enum ShippingStatus {
  PENDING = Status.PENDING,
  SHIPPED = Status.SHIPPED,
  DELIVERED = Status.DELIVERED,
  CANCELLED = Status.CANCELLED,
  PARTIALLY_SHIPPED = Status.PARTIALLY_SHIPPED,
}
