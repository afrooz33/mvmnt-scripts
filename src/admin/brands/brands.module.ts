import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandsController } from './brands.controller'
import { BrandsService } from './brands.service'
import { IsLanguageActiveConstraint } from '@app/src/shared/validations'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { LanguagesModule } from '@app/src/admin/languages/languages.module'
import { BrandTranslationEntity } from '@app/src/admin/brands/entities/brand.translation.entity'
import { BrandSubscriber } from './entities/brand.subscriber'

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity, BrandTranslationEntity]), LanguagesModule],
  controllers: [BrandsController],
  providers: [BrandsService, IsLanguageActiveConstraint, BrandSubscriber],
  exports: [BrandsService],
})
export class BrandsModule {}
