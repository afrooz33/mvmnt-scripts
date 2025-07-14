import BigNumber from 'bignumber.js'
import { Column, Entity, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { UserStarsEntity } from '@app/src/users/stars/entities/stars.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { ResellingEventEntity } from './reselling-event.entity'
import { ResellingRewardStatus } from '@app/src/users/reselling/enums'
import { ResellingRewardMemoEntity } from './reselling-reward-memo.entity'

@Entity('reselling_rewards')
export class ResellingRewardEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  user: UserEntity

  @ManyToOne(() => BuynowCartEntity, { nullable: false })
  @JoinColumn()
  cart: BuynowCartEntity

  @ManyToOne(() => BuynowCartItemEntity, { nullable: false })
  @JoinColumn()
  cart_item: BuynowCartItemEntity

  @ManyToOne(() => DealEntity, { nullable: false })
  @JoinColumn()
  deal: DealEntity

  @OneToOne(() => ResellingEventEntity, (event) => event.reward, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  event: ResellingEventEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: false,
  })
  purchase_amount: BigNumber

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    nullable: false,
  })
  reward_value: BigNumber

  @Column({
    type: 'enum',
    enum: ResellingRewardStatus,
    default: ResellingRewardStatus.PENDING,
    nullable: false,
  })
  status: ResellingRewardStatus

  @Column({ type: 'timestamp', nullable: true })
  acquisition_date?: Date

  @Column({ type: 'timestamp', nullable: false })
  scheduled_acquisition_date: Date

  @ManyToOne(() => UserPointsEntity, { nullable: true })
  @JoinColumn()
  points?: UserPointsEntity

  @ManyToOne(() => UserStarsEntity, { nullable: true })
  @JoinColumn()
  stars?: UserStarsEntity

  @OneToMany(() => ResellingRewardMemoEntity, (memo) => memo.reward, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  memo: ResellingRewardMemoEntity[]
}
