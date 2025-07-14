import { Status } from '@app/src/shared/enums'

export enum EmailVerificationStatus {
  EMAIL_SENT = Status.EMAIL_SENT,
  EMAIL_VERIFICATION_EXPIRED = Status.EMAIL_VERIFICATION_EXPIRED,
  EMAIL_VERIFIED = Status.EMAIL_VERIFIED,
}
