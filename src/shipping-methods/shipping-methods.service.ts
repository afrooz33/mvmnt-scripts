import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { ShippingMethodEntity } from '@app/src/admin/shipping-methods/entities/shipping-method.entity'
import { showService, showOneService } from './services'

@Injectable()
export class ShippingMethodsService extends MyService<ShippingMethodEntity> {
  constructor(
    @InjectRepository(ShippingMethodEntity)
    private readonly shippingMethodRepository: Repository<ShippingMethodEntity>,
  ) {
    super(shippingMethodRepository, 'shipping-methods')
  }

  show = showService.bind(this)
  showOne = showOneService.bind(this)
}
