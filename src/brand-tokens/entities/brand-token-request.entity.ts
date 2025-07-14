import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'
import { BrandTokenEntity } from '@app/src/brand-tokens/entities/brand-token.entity'

@Entity('brand_token_requests')
export class BrandTokenRequestEntity extends MyEntity {
  @Column({ type: 'enum', enum: BrandTokenRequestStatus })
  status: BrandTokenRequestStatus

  @Column({ nullable: true })
  admin_notes: string

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => BrandTokenEntity, { nullable: true })
  @JoinColumn()
  brand_token: BrandTokenEntity
}
