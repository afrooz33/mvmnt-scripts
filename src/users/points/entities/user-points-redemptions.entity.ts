import BigNumber from 'bignumber.js'
import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { UserPointsEntity } from './user-points.entity'

@Entity('user_point_redemptions')
export class UserPointRedemptionsEntity extends MyEntity {
  @ManyToOne(() => UserPointsEntity)
  userPoints: UserPointsEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
  })
  amount: BigNumber
}
