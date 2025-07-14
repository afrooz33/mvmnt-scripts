import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { DealCategoryController } from './category.controller'
import { DealCategoryService } from './category.service'

@Module({
  imports: [TypeOrmModule.forFeature([DealCategoryEntity])],
  controllers: [DealCategoryController],
  providers: [DealCategoryService],
  exports: [DealCategoryService],
})
export class DealCategoryModule {}
