import { Get, Put, Post, Body, UseGuards, Controller, Query, Delete, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { BadRequestResponse, UnauthorizedResponse } from '@app/src/shared/swagger/responses'
import { PaymentWalletsService } from './services'
import { RegisterWalletDto, VerifyWalletDto } from './dto'

@ApiTags('User Payment Methods')
@Controller('user/payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentWalletsService: PaymentWalletsService) {}

  @Get('wallet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all verified user wallets' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async getWallets(@User('id') userId: string, @Query() query: MyPaginateDto) {
    return this.paymentWalletsService.showWallets(query, userId)
  }

  @Post('wallet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a User Wallet' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  registerWallet(@User('id') userId: string, @Body() payload: RegisterWalletDto) {
    return this.paymentWalletsService.registerWallet(userId, payload)
  }

  @Put('wallet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a Wallet registration' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  verifyWallet(@User('id') userId: string, @Body() payload: VerifyWalletDto) {
    return this.paymentWalletsService.verifyWallet(userId, payload)
  }

  @Delete('wallet/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a Wallet' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  deleteWallet(@User('id') userId: string, @Param('id') walletId: string) {
    return this.paymentWalletsService.deleteWallet(userId, walletId)
  }
}
