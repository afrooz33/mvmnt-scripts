import { Status } from '@app/src/shared/enums'

export enum WishlistStatus {
  PUBLIC = Status.PUBLIC,
  PRIVATE = Status.PRIVATE,
  ANYONE_WITH_LINK = Status.ANYONE_WITH_LINK,
  DELETED = Status.DELETED,
}
