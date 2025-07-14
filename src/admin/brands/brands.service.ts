import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { MyService } from '@app/src/shared/base'

@Injectable()
export class BrandsService extends MyService<BrandEntity> {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
  ) {
    super(brandRepository, 'admin/brands')
  }
}
