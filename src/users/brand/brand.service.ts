import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { getAlphabeticallyService } from './services'

@Injectable()
export class BrandService extends MyService<BrandEntity> {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
    private readonly entityManager: EntityManager,
  ) {
    super(brandRepository, 'user/brands')
  }

  getAlphabetically = getAlphabeticallyService.bind(this)
}
