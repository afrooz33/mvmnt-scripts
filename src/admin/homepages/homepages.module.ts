import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { HomepagesService } from './homepages.service'
import { HomepagesController } from './homepages.controller'
import { HomepagesEntity } from './entities/homepages.entity'
import { HomepageContentEntity } from './entities/homepage-content.entity'
import { HomepageTranslationEntity } from './entities/homepages-translation.entity'
import { HomepageSearchConditionsEntity } from './entities/search-conditions.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      DealEntity,
      BrandEntity,
      HomepagesEntity,
      DealCategoryEntity,
      HomepageContentEntity,
      HomepageTranslationEntity,
      HomepageSearchConditionsEntity,
    ]),
  ],
  controllers: [HomepagesController],
  providers: [HomepagesService],
})
export class HomepagesModule {}
