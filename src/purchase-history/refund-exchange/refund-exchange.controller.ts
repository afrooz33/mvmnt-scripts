import { Get, Post, Body, Query, Param, Patch, UseGuards, Controller } from '@nestjs/common'
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
import { ReturnExchangeService } from './refund-exchange.service'
import {
  ReturnStatusQueryDto,
  ReturnHistoryQueryDto,
  ShipReturnExchangeDto,
  CreateReturnExchangeDto,
  UpdateReturnExchangeDto,
} from './dto'

@ApiTags('Purchase History - Refund Exchange')
@Controller('refund-exchange')
export class ReturnExchangeController {
  constructor(private returnExchangeService: ReturnExchangeService) {}

  @Get('return-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Get return/exchange status for an order' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  getReturnStatusForBuyer(@Query() query: ReturnStatusQueryDto, @User('id') buyerId: string) {
    return this.returnExchangeService.getReturnStatus(query, buyerId)
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Get return history for a specific cart item' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  showHistory(@User('id') userId: string, @Query() query: ReturnHistoryQueryDto) {
    return this.returnExchangeService.showHistory(query, userId)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a return/exchange request' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  createReturnExchange(@User('id') userId: string, @Body() body: CreateReturnExchangeDto) {
    return this.returnExchangeService.create(body, userId)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: approve/partially-approve/reject return/exchange' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  sellerUpdateStatus(
    @Param('id') id: string,
    @User('id') user: string,
    @Body() payload: UpdateReturnExchangeDto,
  ) {
    return this.returnExchangeService.sellerUpdateStatus(user, id, payload)
  }

  @Post('item/:id/ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: ship item(s) back to seller' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  shipReturnExchange(
    @User('id') user: string,
    @Param('id') id: string,
    @Body() body: ShipReturnExchangeDto,
  ) {
    return this.returnExchangeService.shipReturnExchange(user, id, body)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single return/exchange request by ID' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findOne(@User('id') user: string, @Param('id') id: string) {
    return this.returnExchangeService.findOneReturnExchange(id, user)
  }

  @Get('item/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single return/exchange ITEM by ID' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findOneItem(@User('id') user: string, @Param('id') id: string) {
    return this.returnExchangeService.findOneItem(id, user)
  }
}
