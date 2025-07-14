import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { BrandController } from './brand.controller'
import { BrandService } from './brand.service'

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity])],
  controllers: [BrandController],
  providers: [BrandService],
})
export class BrandModule {}
