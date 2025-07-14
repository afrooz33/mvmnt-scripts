import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
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
import { QueryDto, LogWalletTransferDto } from '@app/src/users/wallet-transaction-history/dto'
import { WalletTransactionHistoryService } from './wallet-transaction-history.service'

@ApiTags('Nonprofit Wallet Transaction History')
@Controller('nonprofit/wallet-transaction-history')
export class WalletTransactionHistoryController {
  constructor(private readonly historyService: WalletTransactionHistoryService) {}

  @Get()
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  @ApiOperation({ summary: "Get logged-in nonprofit's wallet transaction history" })
  async getMyHistory(@User('id') userId: string, @Query() query: QueryDto): Promise<PaginateRO> {
    return this.historyService.show(userId, query)
  }

  @Post('log-transfer')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiCreatedResponse(GetResponse('Wallet transfer logged successfully.'))
  @ApiNotFoundResponse(GetResponse('Sender wallet, user or currency not found.'))
  @ApiOperation({ summary: 'Log a wallet-to-wallet token transfer for nonprofit' })
  async logWalletTransfer(
    @User('id') userId: string,
    @Body() payload: LogWalletTransferDto,
  ): Promise<SuccessRO> {
    return this.historyService.logWalletTransfer(userId, payload)
  }
}
