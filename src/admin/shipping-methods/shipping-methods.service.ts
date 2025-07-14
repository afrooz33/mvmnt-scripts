import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { ImagesService } from '@app/src/images/images.service'
import { ShippingMethodEntity } from './entities/shipping-method.entity'

@Injectable()
export class ShippingMethodsService extends MyService<ShippingMethodEntity> {
  constructor(
    @InjectRepository(ShippingMethodEntity)
    private readonly shippingMethodRepository: Repository<ShippingMethodEntity>,
    private readonly imagesService: ImagesService,
  ) {
    super(shippingMethodRepository, 'admin/shipping-methods')
  }
}
