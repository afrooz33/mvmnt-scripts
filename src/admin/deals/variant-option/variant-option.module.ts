import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { VariantOptionController } from './variant-option.controller'
import { VariantOptionService } from './variant-option.service'
import { DealOptionEntity } from '@app/src/users/deal/entities/deal-option.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DealOptionEntity])],
  controllers: [VariantOptionController],
  providers: [VariantOptionService],
  exports: [VariantOptionService],
})
export class VariantOptionModule {}
