import { Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ShareEntity } from '@app/src/users/share/entities/share.entity'

@Entity('user_deals_shares')
export class DealShareEntity extends ShareEntity {
  @ManyToOne(() => DealEntity)
  @JoinColumn()
  @JoinTable()
  deal: DealEntity
}
