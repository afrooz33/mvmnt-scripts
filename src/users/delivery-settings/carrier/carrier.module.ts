import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { DeliverySettingsEntity } from '@app/src/users/delivery-settings/entities/delivery-settings.entity'
import { DeliveryCarrierService } from './carrier.service'
import { DeliveryCarrierController } from './carrier.controller'
import { DeliveryCarrierEntity } from './entities/delivery-carrier.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliverySettingsEntity, DeliveryCarrierEntity]),
    UserModule,
    ConfigModule,
  ],
  controllers: [DeliveryCarrierController],
  providers: [DeliveryCarrierService],
  exports: [DeliveryCarrierService],
})
export class DeliveryCarrierModule {}
