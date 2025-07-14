import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Entity('system_fees')
export class SystemFeeEntity extends MyEntity {
  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  default_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  auction_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  raffle_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  buynow_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  bussiness_auction_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  bussiness_raffle_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  bussiness_buynow_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  donation_project_donation_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  nonprofit_donation_fee: number

  @Column({
    type: 'decimal',
    default: 0,
    precision: 10,
    scale: 2,
    nullable: false,
  })
  fundraiser_donation_fee: number

  @OneToOne(() => UserEntity, { cascade: true, nullable: true })
  @JoinColumn()
  user: UserEntity
}
