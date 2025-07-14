import { DealProperty } from '@app/src/shared/enums'

export enum DealAdminStatusFilter {
  ENDED = DealProperty.ENDED,
  REVIEW = DealProperty.REVIEW,
  HIDDEN = DealProperty.HIDDEN,
  BANNED = DealProperty.BANNED,
  DELETED = DealProperty.DELETED,
  ON_DEAL = DealProperty.ON_DEAL,
  UNLISTED = DealProperty.UNLISTED,
  SUSPENDED = DealProperty.SUSPENDED,
  SCHEDULED = DealProperty.SCHEDULED,
  DELETE_REQUESTED = DealProperty.DELETE_REQUESTED,
}
