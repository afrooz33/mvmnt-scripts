import { Status } from '@app/src/shared/enums'

export enum PurchaseStatus {
  ON_DEAL = Status.ON_DEAL,
  SEND_ITEM = Status.SEND_ITEM,
  COMPLETED = Status.COMPLETED,
  CANCELLED = Status.CANCELLED,
  REVIEW_DEAL = Status.REVIEW_DEAL,
  WAITING_SHIPMENT = Status.WAITING_SHIPMENT,
}
