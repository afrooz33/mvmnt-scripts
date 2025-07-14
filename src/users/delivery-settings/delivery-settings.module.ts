import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { ShippingProfileEntity } from '@app/src/users/shipping-profiles/entities/shipping-profiles.entity'
import { DeliveryCarrierModule } from './carrier/carrier.module'
import { ProductTagModule } from './product-tag/product-tag.module'
import { DeliverySettingsService } from './delivery-settings.service'
import { DeliverySettingsController } from './delivery-settings.controller'
import { DeliverySettingsEntity } from './entities/delivery-settings.entity'
import { UnattendedSettingEntity } from './entities/unattended-settings.entity'
import { DeliveryCarrierEntity } from './carrier/entities/delivery-carrier.entity'
import { GeneralDeliverySettingsEntity } from './entities/general-delivery-settings.entity'
import { DestinationPreferenceModule } from './destination-preference/destination-preference.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DealVariantEntity,
      ShippingProfileEntity,
      DeliverySettingsEntity,
      DeliveryCarrierEntity,
      UnattendedSettingEntity,
      GeneralDeliverySettingsEntity,
    ]),
    UserModule,
    ConfigModule,
    ProductTagModule,
    DeliveryCarrierModule,
    DestinationPreferenceModule,
  ],
  controllers: [DeliverySettingsController],
  providers: [DeliverySettingsService],
  exports: [DeliverySettingsService],
})
export class DeliverySettingsModule {}
