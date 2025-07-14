import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DealOptionEntity } from '@app/src/users/deal/entities/deal-option.entity'
import { VariantOptionController } from './variant-option.controller'
import { VariantOptionService } from './variant-option.service'

@Module({
  imports: [TypeOrmModule.forFeature([DealOptionEntity])],
  controllers: [VariantOptionController],
  providers: [VariantOptionService],
  exports: [VariantOptionService],
})
export class VariantOptionModule {}
