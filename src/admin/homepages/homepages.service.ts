import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { HomepagesEntity } from './entities/homepages.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { HomepageContentEntity } from './entities/homepage-content.entity'
import { HomepageTranslationEntity } from './entities/homepages-translation.entity'
import { HomepageSearchConditionsEntity } from './entities/search-conditions.entity'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import {
  createService,
  showOneService,
  editContentService,
  manualUserFilterService,
  manualDealFilterService,
} from './services'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

@Injectable()
export class HomepagesService extends MyService<HomepagesEntity> {
  constructor(
    @InjectRepository(HomepagesEntity)
    private readonly homepageRepository: Repository<HomepagesEntity>,
    @InjectRepository(HomepageContentEntity)
    private readonly homepageContentRepository: Repository<HomepageContentEntity>,
    @InjectRepository(HomepageTranslationEntity)
    private readonly homepageTranslationRepository: Repository<HomepageTranslationEntity>,
    @InjectRepository(HomepageSearchConditionsEntity)
    private readonly homepageSearchConditionsRepository: Repository<HomepageSearchConditionsEntity>,
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(DealCategoryEntity)
    private readonly dealCategoryRepository: Repository<DealCategoryEntity>,
    @InjectRepository(DealEntity)
    private readonly dealRepository: Repository<DealEntity>,
  ) {
    super(homepageRepository, 'admin/homepages')
  }

  create = createService.bind(this)
  showOne = showOneService.bind(this)
  editContent = editContentService.bind(this)
  manualUserFilter = manualUserFilterService.bind(this)
  manualDealFilter = manualDealFilterService.bind(this)
}
