import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { UserTypes } from '@app/src/shared/enums'
import {
  BadRequestResponse,
  GetResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserWithdrawalRequestService } from './user-withdrawal-request.service'
import {
  InitiateWithdrawalRequestDto,
  RevertWithdrawalRequestDto,
  ConfirmWithdrawalRequestDto,
  UpdateWithdrawalRequestHashDto,
} from './dto'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'

@ApiTags('User Withdrawal')
@Controller('user/withdrawal/request')
export class UserWithdrawalRequestController {
  constructor(private readonly userWithdrawalRequestService: UserWithdrawalRequestService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate a Withdrawal Request' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async requestInitiate(@User('id') userId: string, @Body() payload: InitiateWithdrawalRequestDto) {
    return await this.userWithdrawalRequestService.initiateRequest(userId, payload)
  }

  @Post('revert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiOperation({ summary: 'Revert a Withdrawal Request' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Withdrawal Not Found'))
  async requestRevert(@User('id') userId: string, @Body() payload: RevertWithdrawalRequestDto) {
    return await this.userWithdrawalRequestService.revertRequest(userId, payload)
  }

  @UseGuards(SubgraphGuard)
  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a Withdrawal Request' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async requestConfirm(@Body() payload: ConfirmWithdrawalRequestDto) {
    return await this.userWithdrawalRequestService.confirmRequest(payload)
  }

  @Put('hash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Transaction Hash for a Withdrawal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Withdrawal Request not found'))
  async updateTransactionHash(
    @User('id') userId: string,
    @Body() payload: UpdateWithdrawalRequestHashDto,
  ) {
    return await this.userWithdrawalRequestService.updateTransactionHash(userId, payload)
  }
}
