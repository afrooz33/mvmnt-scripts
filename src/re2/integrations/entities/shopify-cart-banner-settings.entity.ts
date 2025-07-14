import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UpdateStatus } from '@app/src/shared/enums'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { ShopifyIntegrationsEntity } from './shopify-integration.entity'
import { cartBannerToResponseObject } from './methods'

@Entity('re2_shopify_cart_banner_settings')
export class ShopifyCartBannerSettingEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string

  @Column({
    type: 'enum',
    enum: Object.values(UpdateStatus),
    nullable: false,
  })
  round_up_total_status: UpdateStatus

  @Column({
    type: 'enum',
    enum: Object.values(UpdateStatus),
    nullable: false,
  })
  add_single_item_status: UpdateStatus

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  round_up_total_value: number

  @ManyToOne(() => ShopifyIntegrationsEntity, (shopify) => shopify.cart_banner_settings, {
    nullable: false,
    cascade: true,
  })
  shopify_integration: ShopifyIntegrationsEntity

  @ManyToMany(() => NonprofitUserEntity, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({ name: 're2_shopify_cart_banner_nonprofits' })
  nonprofits: NonprofitUserEntity[]

  @ManyToMany(() => DonationProjectEntity, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({ name: 're2_shopify_cart_banner_donation_projects' })
  donation_projects: DonationProjectEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(IntegrationStatus),
    nullable: false,
  })
  status: IntegrationStatus

  public toResponseObject = cartBannerToResponseObject.bind(this)
}
