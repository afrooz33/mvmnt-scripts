import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { SuccessRO } from '@app/src/shared/dto'
import { UserWithdrawalService } from './user-withdrawal.service'
import { RejectWithdrawalDto } from './dto'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'

@ApiTags('User Withdrawal')
@Controller('user/withdrawal')
export class UserWithdrawalController {
  constructor(private readonly userWithdrawalService: UserWithdrawalService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all withdraws of a User' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async getUserWithdrawals(@User('id') userId: string): Promise<SuccessRO> {
    return await this.userWithdrawalService.getUserWithdrawals(userId)
  }

  @UseGuards(SubgraphGuard)
  @Post('reject')
  @ApiOperation({ summary: 'Reject a user withdrawal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Withdrawal not found'))
  async rejectWithdrawal(@Body() payload: RejectWithdrawalDto): Promise<SuccessRO> {
    return await this.userWithdrawalService.rejectWithdrawal(payload.withdraw_id)
  }
}
