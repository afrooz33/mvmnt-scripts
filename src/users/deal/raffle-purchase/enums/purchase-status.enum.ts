import { Status } from '@app/src/shared/enums'

export enum PurchaseStatus {
  ON_DEAL = Status.ON_DEAL,
  INITIATED = Status.INITIATED,
  SEND_ITEM = Status.SEND_ITEM,
  COMPLETED = Status.COMPLETED,
  CANCELLED = Status.CANCELLED,
}
