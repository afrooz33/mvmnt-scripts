import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import {
  GetResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { LogWalletTransferDto, QueryDto } from './dto'
import { WalletTransactionHistoryService } from './wallet-transaction-history.service'

@ApiTags('User Wallet Transaction History')
@Controller('user/wallet-transaction-history')
export class WalletTransactionHistoryController {
  constructor(private readonly historyService: WalletTransactionHistoryService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  @ApiOperation({ summary: "Get logged-in user's wallet transaction history" })
  async getMyHistory(@User('id') userId: string, @Query() query: QueryDto): Promise<PaginateRO> {
    return this.historyService.show(userId, query)
  }

  @Post('log-transfer')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Log a wallet-to-wallet token transfer' })
  @ApiCreatedResponse(GetResponse('Wallet transfer logged successfully.'))
  @ApiNotFoundResponse(GetResponse('Sender wallet, user or currency not found.'))
  async logWalletTransfer(
    @User('id') userId: string,
    @Body() payload: LogWalletTransferDto,
  ): Promise<SuccessRO> {
    return this.historyService.logWalletTransfer(userId, payload)
  }
}
