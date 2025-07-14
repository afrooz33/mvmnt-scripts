import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TemplateController } from './template.controller'
import { TemplateService } from './template.service'
import { DealShippingFeeTemplateEntity } from './entities/shipping-fee.entity'

@Module({
  imports: [TypeOrmModule.forFeature([DealShippingFeeTemplateEntity])],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
