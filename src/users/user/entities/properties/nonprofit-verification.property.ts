import { Column } from 'typeorm'
import { NonprofitVerificationStatus } from '@app/src/users/user/enums'

export class NonprofitVerification {
  @Column('text', { nullable: true })
  token: string

  @Column({
    type: 'enum',
    enum: Object.values(NonprofitVerificationStatus),
    default: NonprofitVerificationStatus.EMAIL_SENT,
  })
  status: NonprofitVerificationStatus

  @Column('timestamptz', { nullable: true })
  request_date: Date

  @Column('timestamptz', { nullable: true })
  verification_date: Date
}
