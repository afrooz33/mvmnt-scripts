import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'
import { ProfileEntity } from '@app/src/users/profile/entities/profile.entity'
import { PostcodeEntity } from '@app/src/admin/geo/entities/postcode.entity'
import { AddressEntity } from './entities/address.entity'
import {
  showService,
  createService,
  updateService,
  deleteService,
  setDefaultService,
} from './services'

@Injectable()
export class AddressService extends MyService<AddressEntity> {
  constructor(
    @InjectRepository(AddressEntity)
    public readonly addressRepository: Repository<AddressEntity>,
    @InjectRepository(ProfileEntity)
    public readonly profileRepository: Repository<ProfileEntity>,
    @InjectRepository(CountryEntity)
    public readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(PostcodeEntity)
    public readonly postcodeRepository: Repository<PostcodeEntity>,
  ) {
    super(addressRepository, 'user/address')
  }

  show = showService.bind(this)
  create = createService.bind(this)
  update = updateService.bind(this)
  delete = deleteService.bind(this)
  setDefault = setDefaultService.bind(this)
}
