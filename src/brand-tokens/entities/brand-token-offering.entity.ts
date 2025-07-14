import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { BrandTokenEntity } from './brand-token.entity'
import { BrandTokenOfferingPhaseEntity } from './brand-token-offering-phase.entity'

@Entity('brand_token_offerings')
export class BrandTokenOfferingEntity extends MyEntity {
  @ManyToOne(() => BrandTokenEntity, { nullable: false })
  @JoinColumn()
  brand_token: BrandTokenEntity

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  page_url: string

  @Column({ type: 'timestamp' })
  start_date: Date

  @Column({ type: 'timestamp' })
  end_date: Date

  @Column({ type: 'bigint' })
  total_allocation: string

  @Column({ type: 'bigint', default: '0' })
  total_sold: string

  @Column({ type: 'boolean', default: false })
  is_ended: boolean

  @OneToMany(() => BrandTokenOfferingPhaseEntity, (phase) => phase.offering)
  phases: BrandTokenOfferingPhaseEntity[]
}
