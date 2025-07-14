import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { RevertPaymentService } from './revert-payment.service'
import { ValidationPipe } from '@app/src/shared/validations'
import { SuccessRO } from '@app/src/shared/dto'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { RevertDealPaymentDto } from '@app/src/users/payment/modules/revert/dto'
import { User } from '@app/src/shared/auth/decorators'

@ApiTags('User Payment')
@Controller('user/payment/revert')
export class RevertPaymentController {
  constructor(private readonly revertPaymentService: RevertPaymentService) {}

  @Post('buynow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Revert BuyNow Payment that was initiated' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Payment Item does not exist'))
  revertBuynowPayment(
    @Body() payload: RevertDealPaymentDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.revertPaymentService.revertBuynowPayment(payload, userId)
  }

  @Post('raffle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Revert Raffle Payment that was initiated' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Payment Item does not exist'))
  revertRafflePayment(
    @Body() payload: RevertDealPaymentDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.revertPaymentService.revertRafflePayment(payload, userId)
  }

  @Post('auction')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Revert Auction Payment that was initiated' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Payment Item does not exist'))
  revertAuctionPayment(
    @Body() payload: RevertDealPaymentDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.revertPaymentService.revertAuctionPayment(payload, userId)
  }
}
