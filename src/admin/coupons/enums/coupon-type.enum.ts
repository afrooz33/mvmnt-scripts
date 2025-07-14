import { Status } from '@app/src/shared/enums'

export enum CouponType {
  FIXED = Status.FIXED,
  PERCENTAGE = Status.PERCENTAGE,
  ITEM_PRICE = Status.ITEM_PRICE,
  TOTAL_ORDER = Status.TOTAL_ORDER,
  FREE_SHIPPING = Status.FREE_SHIPPING,
}
