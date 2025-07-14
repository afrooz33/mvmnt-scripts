import { Column } from 'typeorm'
import { EmailVerificationStatus } from '@app/src/users/user/enums'

export class EmailVerification {
  @Column('text', { nullable: true })
  token: string

  @Column({
    type: 'enum',
    enum: Object.values(EmailVerificationStatus),
    default: EmailVerificationStatus.EMAIL_SENT,
  })
  status: EmailVerificationStatus

  @Column('timestamptz', { nullable: true })
  request_date: Date

  @Column('timestamptz', { nullable: true })
  verification_date: string
}
