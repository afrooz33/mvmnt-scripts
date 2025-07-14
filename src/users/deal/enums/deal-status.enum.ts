import { DealProperty } from '@app/src/shared/enums'

export enum DealStatus {
  ENDED = DealProperty.ENDED,
  DRAFT = DealProperty.DRAFT,
  HIDDEN = DealProperty.HIDDEN,
  DELETED = DealProperty.DELETED,
  ON_DEAL = DealProperty.ON_DEAL,
  UNLISTED = DealProperty.UNLISTED,
  DECLINED = DealProperty.DECLINED,
  SUSPENDED = DealProperty.SUSPENDED,
  SCHEDULED = DealProperty.SCHEDULED,
  TERMINATED = DealProperty.TERMINATED,
  DELETE_REQUESTED = DealProperty.DELETE_REQUESTED,
}
