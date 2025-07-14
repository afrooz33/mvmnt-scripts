import { Check, Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { DealRaffleEntity } from './deal-raffle.entity'

@Entity('deal_raffle_prizes')
export class DealRafflePrizeEntity extends MyEntity {
  @Check('rank >= 1 AND rank <= 5')
  @Column({ type: 'smallint', nullable: false, unsigned: true })
  rank: number

  @Column({ type: 'varchar', nullable: false, length: 255 })
  name: string

  @Column({ type: 'smallint', nullable: false, unsigned: true })
  number_of_winners: string

  @ManyToMany(() => ImagesEntity, (image) => image.prizes)
  @JoinTable()
  images: ImagesEntity[]

  @ManyToOne(() => DealRaffleEntity, (deal) => deal.raffle_prizes)
  raffles: DealRaffleEntity
}
