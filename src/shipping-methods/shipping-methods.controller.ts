import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger'
import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { FilterDeleted } from '@app/src/shared/decorators'
import { ForbiddenResponse, BadRequestResponse } from '@app/src/shared/swagger/responses'
import { ShippingMethodEntity } from '@app/src/admin/shipping-methods/entities/shipping-method.entity'
import { ShippingMethodsService } from './shipping-methods.service'
import { QueryDto } from './dto'

@ApiTags('shipping-methods')
@Controller('shipping-methods')
export class ShippingMethodsController {
  constructor(private readonly shippingMethodsService: ShippingMethodsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Public - Get shipping method' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOkResponse({ type: ShippingMethodEntity })
  async showOne(@Param('id') id: string): Promise<ShippingMethodEntity> {
    return this.shippingMethodsService.showOne(id)
  }

  @Get()
  @ApiOperation({ summary: 'Public - Get all shipping methods' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.shippingMethodsService.toggleCustomPagination().show(query)
  }
}
