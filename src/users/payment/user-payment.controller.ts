import { Body, Controller, Put, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {
  GetResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserPaymentService } from './user-payment.service'
import { ValidationPipe } from '@app/src/shared/validations'
import { SuccessRO } from '@app/src/shared/dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { UserTypes } from '@app/src/shared/enums'
import { UpdatePaymentHashDto } from './dto'

@ApiTags('User Payment')
@Controller('user/payment')
export class UserPaymentController {
  constructor(private readonly userPaymentService: UserPaymentService) {}

  @Put('hash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Update the Transaction Hash for a payment' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Payment Item does not exist'))
  updateTransactionHash(
    @Body() payload: UpdatePaymentHashDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.userPaymentService.updateTransactionHash(payload, userId)
  }
}
