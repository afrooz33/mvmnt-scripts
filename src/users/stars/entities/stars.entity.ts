import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { StarType, StarActionType, ContributionStarType } from '@app/src/users/stars/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { InvitationEntity } from '@app/src/users/invitation/entities/invitation.entity'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'

@Entity('user_stars')
@Index(['user', 'type', 'action'])
export class UserStarsEntity extends MyEntity {
  @ManyToOne(() => UserEntity, (user) => user.stars)
  user: UserEntity

  @Column({
    type: 'enum',
    enum: Object.values(StarType),
    default: StarType.TRANSACTION,
    nullable: false,
  })
  type: StarType

  @Column({
    type: 'enum',
    enum: Object.values(ContributionStarType),
    nullable: true,
  })
  contribution_star_type: ContributionStarType

  @ManyToOne(() => UserDealPaymentEntity, (payment) => payment.items, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  deal_payment?: UserDealPaymentEntity

  @Column({
    type: 'enum',
    enum: Object.values(StarActionType),
    default: StarActionType.ORDER_CREATED,
    nullable: false,
  })
  action: StarActionType

  @Column({ type: 'float', nullable: false, default: 0 })
  stars: number

  @ManyToOne(() => BuynowCartEntity, { nullable: true })
  @JoinColumn()
  cart?: BuynowCartEntity

  @ManyToOne(() => UserDonationPaymentEntity, { nullable: true })
  @JoinColumn()
  donation_payment?: UserDonationPaymentEntity

  @ManyToOne(() => DealEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  deal?: DealEntity

  @ManyToOne(() => NonprofitUserEntity, { nullable: true })
  @JoinColumn()
  nonprofit?: NonprofitUserEntity

  @ManyToOne(() => DonationProjectEntity, { nullable: true })
  @JoinColumn()
  donation_project?: DonationProjectEntity

  @ManyToOne(() => FundraiserEntity, { nullable: true })
  @JoinColumn()
  fundraiser?: FundraiserEntity

  @ManyToOne(() => InvitationEntity, { nullable: true })
  @JoinColumn()
  invitation?: InvitationEntity
}
