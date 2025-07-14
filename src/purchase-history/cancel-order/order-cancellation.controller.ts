import { Get, Post, Body, UseGuards, Controller, Query, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { BadRequestResponse, UnauthorizedResponse } from '@app/src/shared/swagger/responses'
import { OrderCancellationService } from './order-cancellation.service'
import { CreateCancellationDto } from './dto'

@ApiTags('Purchase History - Cancel Order')
@Controller('order-cancellation')
export class OrderCancellationController {
  constructor(private readonly orderCancellationService: OrderCancellationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Create a cancellation request' })
  @ApiResponse({
    status: 201,
    description: 'Cancellation request created successfully',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  createCancellationRequest(
    @Body() createCancellationDto: CreateCancellationDto,
    @User('id') userId: string,
  ) {
    return this.orderCancellationService.createCancellationRequest(createCancellationDto, userId)
  }

  @Get('buyer/requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Get all your cancellation requests' })
  @ApiResponse({
    status: 200,
    description: 'Buyer cancellation requests retrieved successfully',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  getBuyerCancellationRequests(@User('id') userId: string, @Query() query: MyPaginateDto) {
    return this.orderCancellationService.getBuyerCancellationRequests(userId, query)
  }

  @Get(':id/buyer/requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer: Get cancellation requests by id' })
  @ApiResponse({
    status: 200,
    description: 'Buyer cancellation requests retrieved successfully',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  findOneCancellationRequest(@User('id') userId: string, @Param('id') id: string) {
    return this.orderCancellationService.findOneCancellationRequest(id, userId)
  }
}
