import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { CouponsEntity } from './coupons.entity'

@Entity('coupon_translations')
export class CouponTranslationEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  name: string

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @ManyToOne(() => CouponsEntity, (coupon) => coupon.translations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinTable()
  coupon: CouponsEntity
}
