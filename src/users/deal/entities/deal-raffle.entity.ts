import { Column, Entity, JoinColumn, JoinTable, OneToMany, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealEntity } from './deal.entity'
import { DealRafflePrizeEntity } from './deal-raffle-prize.entity'

@Entity('deal_raffles')
export class DealRaffleEntity extends MyEntity {
  @Column({ type: 'text', nullable: false })
  price_details: string

  @Column({ type: 'text', nullable: false })
  donation_reason: string

  @Column({ type: 'text', nullable: false })
  donation_rules: string

  @Column('timestamp with time zone', { nullable: false })
  winner_announcement_date: Date

  @OneToMany(() => DealRafflePrizeEntity, (dealRafflePrize) => dealRafflePrize.raffles, {
    cascade: true,
  })
  raffle_prizes: DealRafflePrizeEntity[]

  @OneToOne(() => DealEntity, (deal) => deal.raffles)
  @JoinColumn()
  @JoinTable()
  deal: DealEntity
}
