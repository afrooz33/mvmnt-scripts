import { Unique, Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ResellingEventEntity } from './reselling-event.entity'

@Unique(['user', 'deal'])
@Entity('deal_reselling_links')
export class ResellingLinkEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (user) => user.reselling_links)
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => DealEntity, (deal) => deal.deal_reselling_links, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  deal: DealEntity

  @Column({ type: 'text', unique: true })
  token: string

  @Column({ type: 'text', unique: true })
  short_token: string

  @OneToMany(() => ResellingEventEntity, (event) => event.reselling_link, {
    onDelete: 'CASCADE',
  })
  events?: ResellingEventEntity[]
}
