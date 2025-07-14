import { Column } from 'typeorm'

export class TwoFactorAuthentication {
  @Column('boolean', { default: false })
  enabled: boolean

  @Column('text', { nullable: true })
  secret: string

  @Column('timestamptz', { nullable: true })
  enabled_date: Date

  @Column('timestamptz', { nullable: true })
  disabled_date: Date

  @Column('timestamptz', { nullable: true })
  last_used_date: Date

  @Column('array', { nullable: true, default: [] })
  recovery_codes: string[]

  @Column('string', { nullable: true, default: null })
  qr_code: string
}
