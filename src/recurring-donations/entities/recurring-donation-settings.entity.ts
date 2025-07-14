import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import BigNumber from 'bignumber.js'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { RecurringDonationSignaturesEntity } from './recurring-donation-signatures.entity'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { DonationType } from '@app/src/donations/enums'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { IntegrationsEntity } from '@app/src/re2/integrations/entities/integrations.entity'

@Entity('recurring_donation_settings')
export class RecurringDonationSettingsEntity extends MyEntity {
  @OneToMany(() => RecurringDonationSignaturesEntity, (donation) => donation.setting, {
    cascade: true,
  })
  signatures: RecurringDonationSignaturesEntity[]

  @ManyToOne(() => UserEntity)
  user: UserEntity

  @ManyToOne(() => DealEntity)
  deal: DealEntity

  @ManyToOne(() => DonationProjectEntity)
  donation_project: DonationProjectEntity

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  @JoinColumn()
  donation_currency: TokenWhitelistEntity

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  @JoinColumn()
  payment_currency: TokenWhitelistEntity

  @ManyToOne(() => PaymentWalletsEntity)
  wallet: PaymentWalletsEntity

  @Column('float')
  donation_value: number

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
    nullable: false,
  })
  donation_amount: BigNumber

  @Column({
    type: 'enum',
    enum: Object.values(DonationType),
    nullable: false,
    default: DonationType.DIRECT_DONATION,
  })
  reason: DonationType

  @ManyToOne(() => FundraiserEntity, { nullable: true })
  @JoinColumn()
  fundraiser: FundraiserEntity

  @ManyToOne(() => IntegrationsEntity, { nullable: true })
  @JoinColumn()
  integration: IntegrationsEntity

  @Column('text', { nullable: false })
  merkle_tree_root: string

  @Column('boolean', { default: true })
  is_active: boolean
}
