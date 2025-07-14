import { Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { CouponsEntity } from './coupons.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'

@Entity('coupon_deals_variants')
export class CouponDealEntity extends MyEntity {
  @ManyToOne(() => CouponsEntity, (coupon) => coupon.deals_variants)
  coupon: CouponsEntity

  @ManyToOne(() => DealEntity)
  deal: DealEntity

  @ManyToOne(() => DealVariantEntity, {
    nullable: true,
  })
  variant: DealVariantEntity
}
