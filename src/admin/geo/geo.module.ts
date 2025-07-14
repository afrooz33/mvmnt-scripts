import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GeoService } from './geo.service'
import { GeoController } from './geo.controller'
import { CountryEntity } from './entities/country.entity'
import { PostcodeEntity } from './entities/postcode.entity'
import { ProvinceEntity } from './entities/province.entity'
import { ContinentEntity } from './entities/continent.entity'
import { CountryTranslationEntity } from './entities/country.translation.entity'
import { ProvinceTranslationEntity } from './entities/province.translation.entity'
import { ContinentTranslationEntity } from './entities/continent.translation.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountryEntity,
      ProvinceEntity,
      PostcodeEntity,
      ContinentEntity,
      CountryTranslationEntity,
      ProvinceTranslationEntity,
      ContinentTranslationEntity,
    ]),
  ],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}
