import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { WhitelistStatus } from '@app/src/brand-tokens/enums'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BrandTokenOfferingPhaseEntity } from './brand-token-offering-phase.entity'

@Entity('brand_token_phase_whitelist')
export class BrandTokenPhaseWhitelistEntity extends MyEntity {
  @ManyToOne(() => BrandTokenOfferingPhaseEntity, { nullable: false })
  @JoinColumn()
  phase: BrandTokenOfferingPhaseEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @Column({
    type: 'enum',
    enum: WhitelistStatus,
    default: WhitelistStatus.PENDING,
  })
  status: WhitelistStatus

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date

  @Column({ type: 'boolean', default: false })
  allow_past_participants: boolean
}
