import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { RecurringDonationSettingsEntity } from './recurring-donation-settings.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'

@Entity('recurring_donation_signatures')
export class RecurringDonationSignaturesEntity extends MyEntity {
  @ManyToOne(() => RecurringDonationSettingsEntity, (setting) => setting.signatures)
  @JoinColumn()
  setting: RecurringDonationSettingsEntity

  @Column('timestamptz', { name: 'usage_date' })
  usage_date: Date

  @Column('text', { name: 'merkle_proof' })
  merkle_proof: string

  @Column('boolean', { nullable: false, default: false })
  is_consumed: boolean

  @Column('boolean', { nullable: false, default: false })
  is_deleted: boolean

  @OneToOne(() => UserDonationPaymentEntity)
  @JoinColumn()
  payment: UserDonationPaymentEntity

  @Column('text', { comment: 'Used for lookup from Subgraph' })
  unique_id: string
}
