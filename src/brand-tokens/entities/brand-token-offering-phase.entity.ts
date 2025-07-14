import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { BrandTokenOfferingEntity } from './brand-token-offering.entity'
import { PhaseType } from '@app/src/brand-tokens/enums'
import { UserRank } from '@app/src/users/user/enums'

@Entity('brand_token_offering_phases')
export class BrandTokenOfferingPhaseEntity extends MyEntity {
  @ManyToOne(() => BrandTokenOfferingEntity, { nullable: false })
  @JoinColumn()
  offering: BrandTokenOfferingEntity

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 500 })
  description: string

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
  })
  start_time: Date

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
  })
  end_time: Date

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  min_contribution: number

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  max_contribution: number

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  token_amount: number

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  token_price: number

  @Column({ type: 'int', nullable: true })
  vesting_period?: number

  @Column({ type: 'enum', enum: PhaseType })
  type: PhaseType

  @Column({ type: 'boolean', default: false })
  requires_whitelist: boolean

  @Column({ type: 'enum', enum: UserRank, nullable: true })
  min_rank?: UserRank

  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, any>
}
