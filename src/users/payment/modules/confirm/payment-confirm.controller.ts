import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { ValidationPipe } from '@app/src/shared/validations'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'
import { SuccessRO } from '@app/src/shared/dto'
import { ConfirmDealPaymentReq } from './dto'
import { PaymentConfirmService } from './payment-confirm.service'

@ApiTags('User Payment')
@Controller('user/payment/confirm')
export class PaymentConfirmController {
  constructor(private readonly paymentConfirmService: PaymentConfirmService) {}

  @Post()
  @UseGuards(SubgraphGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Confirm Payment from Subgraph' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Payment Item does not exist'))
  confirmPayment(@Body() payload: ConfirmDealPaymentReq): Promise<SuccessRO> {
    return this.paymentConfirmService.confirmPayment(payload)
  }
}
