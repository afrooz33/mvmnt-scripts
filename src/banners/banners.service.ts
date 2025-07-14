import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { BannerEntity } from '@app/src/admin/banners/entities/banner.entity'
import { showService } from './services'

@Injectable()
export class BannersService extends MyService<BannerEntity> {
  constructor(
    @InjectRepository(BannerEntity)
    private readonly bannerRepository: Repository<BannerEntity>,
  ) {
    super(bannerRepository, 'banners')
  }

  show = showService.bind(this)
}
