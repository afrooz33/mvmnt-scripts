import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { Re2UserEntity } from '@app/src/re2/user/entities/re2-user.entity'
import { IntegrationType, IntegrationStatus } from '@app/src/re2/integrations/enums'
import { ShopifyIntegrationsEntity } from './shopify-integration.entity'

@Entity('re2_integrations')
export class IntegrationsEntity extends MyEntity {
  @Column({
    type: 'enum',
    enum: Object.values(IntegrationType),
    nullable: false,
  })
  type: IntegrationType

  @Column({
    type: 'enum',
    enum: Object.values(IntegrationStatus),
    nullable: false,
  })
  status: IntegrationStatus

  @Column({
    type: 'enum',
    enum: Object.values(IntegrationStatus),
    nullable: true,
    default: null,
  })
  old_status: IntegrationStatus | null

  @ManyToOne(() => Re2UserEntity, (user) => user.integrations, {
    nullable: false,
  })
  user: Re2UserEntity

  @OneToOne(() => ShopifyIntegrationsEntity, (shopify) => shopify.integration, {
    cascade: true,
    nullable: true,
  })
  shopify?: ShopifyIntegrationsEntity
}
