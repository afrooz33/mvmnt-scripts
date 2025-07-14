import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

@Entity('deal_update_notes')
export class UpdateNoteEntity extends MyEntity {
  @Column({ type: 'text', nullable: false })
  note: string

  @ManyToOne(() => DealEntity, (deal) => deal.updateNotes)
  @JoinColumn()
  deal: DealEntity
}
