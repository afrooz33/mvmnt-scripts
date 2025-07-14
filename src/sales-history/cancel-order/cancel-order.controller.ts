import { Get, Put, Body, Param, UseGuards, Controller, Query } from '@nestjs/common'
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { BadRequestResponse, UnauthorizedResponse } from '@app/src/shared/swagger/responses'
import { CancelOrderService } from './cancel-order.service'
import { QueryDto, ApproveCancellationDto, RejectCancellationDto } from './dto'

@ApiTags('Sales History - Cancel Requests')
@Controller('sales-history/cancel-requests')
export class CancelOrderController {
  constructor(private readonly cancelOrderService: CancelOrderService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Get cancel request details' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async showCancelRequest(@Param('id') id: string, @User('id') userId: string): Promise<any> {
    return this.cancelOrderService.showOne(id, userId)
  }

  @Get('list/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Get all cancel requests' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async showCancelRequests(
    @User('id') userId: string,
    @Query() query: QueryDto,
  ): Promise<PaginateRO> {
    return this.cancelOrderService.show(query, userId)
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Approve and process refund for a cancellation request' })
  @ApiResponse({
    status: 200,
    description: 'Cancellation request approved and refund processed successfully',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  approveAndRefundCancellationRequest(
    @Param('id') id: string,
    @User('id') user: string,
    @Body() payload: ApproveCancellationDto,
  ) {
    return this.cancelOrderService.approveAndRefundCancellationRequest(id, user, payload)
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seller: Reject a cancellation request' })
  @ApiResponse({
    status: 200,
    description: 'Cancellation request rejected successfully',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  rejectCancellationRequest(
    @Param('id') id: string,
    @User('id') user: string,
    @Body() payload: RejectCancellationDto,
  ) {
    return this.cancelOrderService.rejectCancellationRequest(id, user, payload)
  }
}
