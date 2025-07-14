import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { RafflePurchaseEntity } from './raffle-purchase.entity'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'
import { DealRafflePrizeEntity } from '@app/src/users/deal/entities/deal-raffle-prize.entity'
import { toWinnerResponseObject } from './methods'

@Entity('user_deal_raffle_winner')
@Unique(['winner', 'prize'])
export class RaffleWinnerEntity extends MyEntity {
  @ManyToOne(() => RafflePurchaseEntity)
  @JoinColumn()
  winner: RafflePurchaseEntity

  @ManyToOne(() => DealRafflePrizeEntity)
  @JoinColumn()
  prize: DealRafflePrizeEntity

  @Column({ type: 'boolean', default: false, nullable: true })
  was_replaced: boolean

  @ManyToOne(() => RafflePurchaseEntity, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  old_winner: RafflePurchaseEntity

  @ManyToOne(() => AdminUserEntity, {
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  replaced_by: AdminUserEntity

  public toResponseObject = toWinnerResponseObject.bind(this)
}
