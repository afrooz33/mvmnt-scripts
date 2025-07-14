import BigNumber from 'bignumber.js'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import DecimalTransformer from '@app/src/shared/transformers/decimal.transformer'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { USER_WITHDRAWAL_STATUS } from '@app/src/users/withdrawal/enums/withdrawal-status.enum'
import { UserWithdrawalPointMapEntity } from './user-withdrawal-point-map.entity'

@Entity('user_withdrawal')
export class UserWithdrawalEntity extends MyEntity {
  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity

  @Column({
    type: 'decimal',
    precision: 28,
    scale: 18,
    transformer: new DecimalTransformer(),
    default: 0.0,
    nullable: false,
  })
  amount: BigNumber

  @ManyToOne(() => TokenWhitelistEntity, { nullable: false })
  @JoinColumn()
  currency: TokenWhitelistEntity

  @Column({ type: 'date', nullable: false })
  unlock_time: Date

  @Column({
    type: 'enum',
    enum: Object.values(USER_WITHDRAWAL_STATUS),
    nullable: false,
  })
  status: USER_WITHDRAWAL_STATUS

  @OneToMany(() => UserWithdrawalPointMapEntity, (pointMap) => pointMap.withdrawal, {
    cascade: true,
  })
  points_map: UserWithdrawalPointMapEntity[]

  @Column('text', { nullable: true, default: null })
  transaction_hash: string
}
