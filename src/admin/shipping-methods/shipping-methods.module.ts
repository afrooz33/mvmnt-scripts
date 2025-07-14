import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImagesModule } from '@app/src/images/images.module'
import { IsImageAvailableConstraint } from '@app/src/shared/validations'
import { ShippingMethodsController } from './shipping-methods.controller'
import { ShippingMethodsService } from './shipping-methods.service'
import { ShippingMethodEntity } from './entities/shipping-method.entity'
import { ShippingMethodSubscriber } from './entities/shipping-method.subscriber'
import { ShippingMethodTranslationEntity } from './entities/shipping-method.translation.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingMethodEntity, ShippingMethodTranslationEntity]),
    ImagesModule,
  ],
  controllers: [ShippingMethodsController],
  providers: [ShippingMethodsService, ShippingMethodSubscriber, IsImageAvailableConstraint],
  exports: [ShippingMethodsService],
})
export class ShippingMethodsModule {}
