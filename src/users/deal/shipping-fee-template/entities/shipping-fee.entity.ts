import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { TemplateStatus } from '@app/src/users/deal/template/enums'
import { ShippingFee } from './properties'

@Entity('deal_shipping_fee_templates')
export class DealShippingFeeTemplateEntity extends MyEntity {
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  title: string

  @Column('jsonb', { nullable: false, default: [] })
  shipping_fees: ShippingFee[]

  @Column({
    type: 'enum',
    enum: Object.values(TemplateStatus),
    default: TemplateStatus.ACTIVE,
    nullable: false,
  })
  status: TemplateStatus

  @ManyToOne(() => UserEntity, (user) => user.shipping_fee_templates)
  @JoinColumn()
  user: UserEntity
}
