import {
  BadRequestResponse,
  GetResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserWithdrawalConcludeService } from './user-withdrawal-conclude.service'
import { ConfirmWithdrawalConcludeDto } from './dto'
import { SubgraphStrategy } from '@app/src/shared/auth/strategies'

@ApiTags('User Withdrawal')
@Controller('user/withdrawal/conclude')
export class UserWithdrawalConcludeController {
  constructor(private readonly userWithdrawalConcludeService: UserWithdrawalConcludeService) {}

  @UseGuards(SubgraphStrategy)
  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a Conclude Withdrawal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async concludeConfirm(@Body() payload: ConfirmWithdrawalConcludeDto) {
    return await this.userWithdrawalConcludeService.confirmConclude(payload)
  }
}
