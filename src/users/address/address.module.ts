import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AddressController } from './address.controller'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { PostcodeEntity } from '@app/src/admin/geo/entities/postcode.entity'
import { AddressService } from './address.service'
import { AddressEntity } from './entities/address.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([AddressEntity, ProfileEntity, CountryEntity, PostcodeEntity]),
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
