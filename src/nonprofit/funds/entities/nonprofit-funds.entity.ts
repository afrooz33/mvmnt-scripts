import BigNumber from 'bignumber.js'
import { MyEntity } from '@app/src/shared/base'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

@Entity('donation_project_funds')
export class NonprofitFundsEntity extends MyEntity {
  @ManyToOne(() => DonationProjectEntity, { nullable: false })
  donation_project: DonationProjectEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
    nullable: false,
  })
  unsettled_funds: BigNumber

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
    nullable: false,
  })
  withdrawable_funds: BigNumber

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  @JoinColumn()
  currency: TokenWhitelistEntity
}
