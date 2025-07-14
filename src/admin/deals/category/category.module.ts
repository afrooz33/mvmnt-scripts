import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LanguagesModule } from '@app/src/admin/languages/languages.module'
import { IsLanguageActiveConstraint } from '@app/src/shared/validations'
import { DealCategoryController } from './category.controller'
import { DealCategoryService } from './category.service'
import { DealCategoryEntity } from './entities/deal-category.entity'
import { DealCategoryTranslationEntity } from './entities/deal-category.translation.entity'
import { CategorySubscriber } from './entities/category.subscriber'

@Module({
  imports: [
    TypeOrmModule.forFeature([DealCategoryEntity, DealCategoryTranslationEntity]),
    LanguagesModule,
  ],
  controllers: [DealCategoryController],
  providers: [DealCategoryService, IsLanguageActiveConstraint, CategorySubscriber],
  exports: [DealCategoryService],
})
export class DealCategoryModule {}
