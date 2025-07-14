import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Entity('user_cards')
export class PaymentCardsEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (user) => user.cards)
  user: UserEntity

  @Column({ type: 'varchar', length: 25 })
  card_brand: string

  @Column({ type: 'int' })
  card_last4: number

  @Column({ type: 'int' })
  card_exp_month: number

  @Column({ type: 'int' })
  card_exp_year: number
}
