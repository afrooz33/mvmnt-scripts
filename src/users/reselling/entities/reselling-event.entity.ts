import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ResellingEventType } from '@app/src/users/reselling/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ResellingLinkEntity } from './reselling.entity'
import { ResellingRewardEntity } from './reselling-reward.entity'

@Entity('deal_reselling_events')
export class ResellingEventEntity extends MyEntity {
  @ManyToOne(() => ResellingLinkEntity, (link) => link.events)
  reselling_link: ResellingLinkEntity

  @Column({
    type: 'enum',
    enum: ResellingEventType,
    nullable: false,
    default: ResellingEventType.VIEW,
  })
  type: ResellingEventType

  @Column({ type: 'json', nullable: true })
  device_info: {
    userAgent: string
    ip: string
    platform: string
    browser: string
    deviceType: string
  }

  @Column({ type: 'text', nullable: true })
  referrer: string

  @Column({ type: 'boolean', default: false })
  reseller_banned: boolean

  @ManyToOne(() => DealEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  deal?: DealEntity

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: UserEntity

  @OneToOne(() => ResellingRewardEntity, (reward) => reward.event)
  reward?: ResellingRewardEntity
}
