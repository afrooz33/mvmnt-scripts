import { Request } from 'express'
import { Body, Controller, Post, Req, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { SuccessRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { ValidationPipe } from '@app/src/shared/validations'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import {
  InitiateRafflePaymentDto,
  InitiateBuynowPaymentDto,
  InitiateAuctionPaymentDto,
} from './dto'
import { PaymentInitiateService } from './payment-initiate.service'

@ApiTags('User Payment')
@Controller('user/payment/initiate')
export class PaymentInitiateController {
  constructor(private readonly initiatePaymentService: PaymentInitiateService) {}
  @Post('buynow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Initiate Payment for Buynow' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  initiateBuyNow(
    @Body() payload: InitiateBuynowPaymentDto,
    @User('id') userId: string,
    @Req() req: Request,
  ): Promise<SuccessRO> {
    return this.initiatePaymentService.initiateBuynowPayment(payload, userId, req)
  }

  @Post('raffle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Initiate Payment for Raffle' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  initiateRaffle(
    @Body() payload: InitiateRafflePaymentDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.initiatePaymentService.initiateRafflePayment(payload, userId)
  }

  @Post('auction')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Initiate Payment for Auction' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  initiateAuction(
    @Body() payload: InitiateAuctionPaymentDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.initiatePaymentService.initiateAuctionPayment(payload, userId)
  }
}
