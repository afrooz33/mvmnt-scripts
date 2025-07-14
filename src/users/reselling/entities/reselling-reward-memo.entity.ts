import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ResellingRewardMemoType } from '@app/src/users/reselling/enums'
import { ResellingRewardEntity } from './reselling-reward.entity'

@Entity('reselling_reward_memo')
export class ResellingRewardMemoEntity extends MyEntity {
  @Column({ type: 'text', nullable: false })
  memo: string

  @Column({
    type: 'enum',
    enum: Object.values(ResellingRewardMemoType),
    default: ResellingRewardMemoType.GENERAL,
    nullable: false,
  })
  type: ResellingRewardMemoType

  @ManyToOne(() => ResellingRewardEntity, (reselling_reward) => reselling_reward.memo, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  reward?: ResellingRewardEntity

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  reseller?: UserEntity
}
