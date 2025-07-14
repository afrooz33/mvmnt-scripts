import { Status } from '@app/src/shared/enums'

export enum NewsStatus {
  PUBLISHED = Status.PUBLISHED,
  DRAFT = Status.DRAFT,
  SCHEDULED = Status.SCHEDULED,
  DELETED = Status.DELETED,
}
