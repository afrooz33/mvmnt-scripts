import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { CountryEntity } from './entities/country.entity'
import { ProvinceEntity } from './entities/province.entity'
import { ContinentEntity } from './entities/continent.entity'
import { PostcodeEntity } from './entities/postcode.entity'
import { showCountriesService, showProvincesService, showPostalCodesService } from './services'

@Injectable()
export class GeoService extends MyService<ContinentEntity> {
  constructor(
    @InjectRepository(ContinentEntity)
    private readonly continentRepository: Repository<ContinentEntity>,
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(ProvinceEntity)
    private readonly provinceRepository: Repository<ProvinceEntity>,
    @InjectRepository(PostcodeEntity)
    public readonly postcodeRepository: Repository<PostcodeEntity>,
  ) {
    super(continentRepository, 'get/continents')
  }

  showCountries = showCountriesService.bind(this)
  showProvinces = showProvincesService.bind(this)
  showPostalCodes = showPostalCodesService.bind(this)
}
