import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { BannerEntity } from './entities/banner.entity'
import { BannerStatus } from './enums'

@Injectable()
export class BannersService extends MyService<BannerEntity> {
  constructor(
    @InjectRepository(BannerEntity)
    public readonly bannersRepository: Repository<BannerEntity>,
  ) {
    super(bannersRepository, 'admin/banners')
  }

  async autoDisableBanners(section: string): Promise<void> {
    const banners = await this.findOne({
      where: {
        section,
        status: BannerStatus.ENABLED,
      },
    })

    if (banners) {
      await this.updateOne({
        ...banners,
        status: BannerStatus.DISABLED,
      })
    }
  }
}
