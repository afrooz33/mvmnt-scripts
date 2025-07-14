import { Status } from '@app/src/shared/enums'

export enum VerificationStatus {
  NOT_VERIFIED = Status.NOT_VERIFIED,
  REVIEW = Status.REVIEW,
  VERIFIED = Status.VERIFIED,
  DECLINED = Status.DECLINED,
}
