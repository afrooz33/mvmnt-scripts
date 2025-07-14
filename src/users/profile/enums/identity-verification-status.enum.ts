import { Status } from '@app/src/shared/enums'

export enum IdentityVerificationStatus {
  NOT_SUBMITTED = Status.NOT_SUBMITTED,
  REVIEW = Status.REVIEW,
  VERIFIED = Status.VERIFIED,
  DECLINED = Status.DECLINED,
}
