import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GeoModule } from '@app/src/admin/geo/geo.module'
import { DealModule } from '@app/src/users/deal/deal.module'
import { UserModule } from '@app/src/users/user/user.module'
import { AddressModule } from '@app/src/users/address/address.module'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { DealVariantInventoryEntity } from '@app/src/users/deal/entities/deal-variant-inventory.entity'
import { ShippingZoneEntity } from './entities/shipping-zones.entity'
import { ShippingPriceEntity } from './entities/shipping-prices.entity'
import { ShippingProfileEntity } from './entities/shipping-profiles.entity'
import { ShippingProfilesController } from './shipping-profiles.controller'
import { ShippingProfilesService } from './shipping-profiles.service'
import { ShippingZoneCountriesEntity } from './entities/shipping-zone-countries.entity'
import { ShippingZoneProvincesEntity } from './entities/shipping-zone-provinces.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DealVariantEntity,
      ShippingZoneEntity,
      ShippingPriceEntity,
      ShippingProfileEntity,
      DealVariantInventoryEntity,
      ShippingZoneProvincesEntity,
      ShippingZoneCountriesEntity,
    ]),
    GeoModule,
    UserModule,
    AddressModule,
    forwardRef(() => DealModule),
  ],
  controllers: [ShippingProfilesController],
  providers: [ShippingProfilesService],
  exports: [ShippingProfilesService],
})
export class ShippingProfilesModule {}
