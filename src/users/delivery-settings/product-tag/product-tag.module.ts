import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { DeliverySettingsEntity } from '@app/src/users/delivery-settings/entities/delivery-settings.entity'
import { ProductTagController } from './product-tag.controller'
import { ProductTagService } from './product-tag.service'
import { ProductTagSettingsEntity } from './entities/product-tag-settings.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliverySettingsEntity, ProductTagSettingsEntity]),
    UserModule,
  ],
  controllers: [ProductTagController],
  exports: [ProductTagService],
  providers: [ProductTagService],
})
export class ProductTagModule {}
