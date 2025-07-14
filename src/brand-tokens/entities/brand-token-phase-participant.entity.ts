import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BrandTokenOfferingPhaseEntity } from './brand-token-offering-phase.entity'

@Entity('brand_token_phase_participants')
export class BrandTokenPhaseParticipantEntity extends MyEntity {
  @ManyToOne(() => BrandTokenOfferingPhaseEntity, { nullable: false })
  @JoinColumn()
  phase: BrandTokenOfferingPhaseEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @Column({ type: 'bigint', default: '0' })
  contribution_amount: string

  @Column({ type: 'bigint', default: '0' })
  tokens_received: string

  @Column({ type: 'bigint', default: '0' })
  bonus_tokens: string

  @Column({ type: 'timestamp' })
  participated_at: Date

  @Column({ type: 'timestamp', nullable: true })
  tokens_claimed_at: Date

  @Column({ type: 'boolean', default: false })
  has_claimed: boolean
}
