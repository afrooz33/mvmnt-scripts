import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { IntegrationsEntity } from './integrations.entity'
import { ShopifyCartBannerSettingEntity } from './shopify-cart-banner-settings.entity'
import { ShopifyCartDrawerSettingEntity } from './shopify-cart-drawer-settings.entity'
import { ShopifySalePortionSettingEntity } from './shopify-sale-portion-settings.entity'

@Entity('re2_shopify_integrations')
export class ShopifyIntegrationsEntity extends MyEntity {
  @Column({
    length: 255,
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  shop: string

  @ManyToOne(() => IntegrationsEntity, (integration) => integration.shopify, {
    nullable: false,
  })
  integration: IntegrationsEntity

  @OneToMany(() => ShopifySalePortionSettingEntity, (settings) => settings.shopify_integration)
  sale_portion_settings?: ShopifySalePortionSettingEntity[]

  @OneToMany(() => ShopifyCartBannerSettingEntity, (settings) => settings.shopify_integration)
  cart_banner_settings?: ShopifyCartBannerSettingEntity[]

  @OneToMany(() => ShopifyCartDrawerSettingEntity, (settings) => settings.shopify_integration)
  cart_drawer_settings?: ShopifyCartDrawerSettingEntity[]
}
