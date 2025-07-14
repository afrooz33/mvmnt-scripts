import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import BigNumber from 'bignumber.js'
import { USER_WITHDRAWAL_STATUS } from '@app/src/users/withdrawal/enums/withdrawal-status.enum'
import { UserWithdrawalEntity } from './user-withdrawal.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'

@Entity('user_withdrawal_point_map')
export class UserWithdrawalPointMapEntity extends MyEntity {
  @ManyToOne(() => UserWithdrawalEntity, (withdrawal) => withdrawal.points_map, { nullable: false })
  @JoinColumn()
  withdrawal: UserWithdrawalEntity

  @ManyToOne(() => UserPointsEntity, { cascade: true })
  @JoinColumn()
  point: UserPointsEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
    nullable: false,
  })
  amount: BigNumber

  @Column({
    type: 'enum',
    enum: Object.values(USER_WITHDRAWAL_STATUS),
    nullable: false,
  })
  status: USER_WITHDRAWAL_STATUS
}
