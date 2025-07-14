import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { ShopifyIntegrationsEntity } from './shopify-integration.entity'
import { cartDrawerToResponseObject } from './methods'

@Entity('re2_shopify_cart_drawer_settings')
export class ShopifyCartDrawerSettingEntity extends MyEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string

  @ManyToOne(() => ShopifyIntegrationsEntity, (shopify) => shopify.cart_drawer_settings, {
    nullable: false,
    cascade: true,
  })
  shopify_integration: ShopifyIntegrationsEntity

  @ManyToMany(() => NonprofitUserEntity, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({ name: 're2_shopify_cart_drawer_nonprofits' })
  nonprofits: NonprofitUserEntity[]

  @ManyToMany(() => DonationProjectEntity, {
    cascade: true,
    nullable: true,
  })
  @JoinTable({ name: 're2_shopify_cart_drawer_donation_projects' })
  donation_projects: DonationProjectEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(IntegrationStatus),
    nullable: false,
  })
  status: IntegrationStatus

  public toResponseObject = cartDrawerToResponseObject.bind(this)
}
