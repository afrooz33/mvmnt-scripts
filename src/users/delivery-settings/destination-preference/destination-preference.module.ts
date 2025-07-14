import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GeoModule } from '@app/src/admin/geo/geo.module'
import { UserModule } from '@app/src/users/user/user.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { ShippingProfilesModule } from '@app/src/users/shipping-profiles/shipping-profiles.module'
import { DeliverySettingsModule } from '@app/src/users/delivery-settings/delivery-settings.module'
import { DestinationPreferenceController } from './destination-preference.controller'
import { DestinationPreferenceService } from './destination-preference.service'
import { DestinationCountryEntity } from './entities/destination-country.entity'
import { DestinationProvinceEntity } from './entities/destination-province.entity'
import { DestinationPreferenceEntity } from './entities/destination-preference.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DestinationCountryEntity,
      DestinationProvinceEntity,
      DestinationPreferenceEntity,
    ]),
    GeoModule,
    UserModule,
    AddressModule,
    ShippingProfilesModule,
    forwardRef(() => DeliverySettingsModule),
  ],
  controllers: [DestinationPreferenceController],
  providers: [DestinationPreferenceService],
  exports: [DestinationPreferenceService],
})
export class DestinationPreferenceModule {}
