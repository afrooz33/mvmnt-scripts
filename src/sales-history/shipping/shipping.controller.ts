import { Get, Post, Body, Param, Patch, UseGuards, Controller } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { BadRequestResponse, UnauthorizedResponse } from '@app/src/shared/swagger/responses'
import { ShippingService } from './shipping.service'
import { CreateShippingDto, UpdateShippingStatusDto } from './dto'
import { OrderShippingEntity } from './entities/order-shipping.entity'

@ApiTags('Sales History - Shipping')
@Controller('sales-history/shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shipping' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async create(
    @Body() createShippingDto: CreateShippingDto,
    @User('id') userId: string,
  ): Promise<OrderShippingEntity> {
    return this.shippingService.createShipping(createShippingDto, userId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an order shipping by ID' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async findOne(@Param('id') id: string): Promise<OrderShippingEntity> {
    return this.shippingService.findOne(id)
  }

  @Get('cart/:cartId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order shipping records by cart ID' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async findByCartId(@Param('cartId') cartId: string): Promise<OrderShippingEntity> {
    return this.shippingService.getShippingStatusByCartId(cartId)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the status of an order shipping (for partial shipments)' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateShippingStatusDto: UpdateShippingStatusDto,
  ): Promise<OrderShippingEntity> {
    return this.shippingService.updateShippingStatus(id, updateShippingStatusDto)
  }
}
