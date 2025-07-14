import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { IntegrationDonationType, IntegrationStatus } from '@app/src/re2/integrations/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { ShopifyIntegrationsEntity } from './shopify-integration.entity'
import { toResponseObject } from './methods'

@Entity('re2_shopify_sale_portion_settings')
export class ShopifySalePortionSettingEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 40,
    nullable: false,
  })
  name: string

  @Column({
    type: 'enum',
    enum: Object.values(IntegrationDonationType),
    nullable: false,
  })
  donation_type: IntegrationDonationType

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  donation_value: number

  @ManyToOne(() => ShopifyIntegrationsEntity, (shopify) => shopify.sale_portion_settings, {
    nullable: false,
    cascade: true,
  })
  shopify_integration: ShopifyIntegrationsEntity

  @ManyToOne(() => NonprofitUserEntity, {
    nullable: true,
  })
  @JoinColumn()
  nonprofit?: NonprofitUserEntity

  @ManyToOne(() => DonationProjectEntity, {
    nullable: true,
  })
  @JoinColumn()
  donation_project?: DonationProjectEntity

  @Column('bigint', { array: true, nullable: true, default: null })
  shopify_products: number[]

  @Column('bigint', { array: true, nullable: true, default: null })
  shopify_collections: number[]

  @Column('bigint', { array: true, nullable: true, default: null })
  shopify_variants: number[]

  @Column({
    type: 'enum',
    enum: Object.values(IntegrationStatus),
    nullable: false,
  })
  status: IntegrationStatus

  public toResponseObject = toResponseObject.bind(this)
}
