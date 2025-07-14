import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ShippingMethodEntity } from '@app/src/admin/shipping-methods/entities/shipping-method.entity'
import { ShippingMethodsController } from './shipping-methods.controller'
import { ShippingMethodsService } from './shipping-methods.service'

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethodEntity])],
  controllers: [ShippingMethodsController],
  providers: [ShippingMethodsService],
})
export class ShippingMethodsModule {}
