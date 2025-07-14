import { Throttle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  BadRequestResponse,
  ConflictResponse,
  ForbiddenResponse,
  GetResponse,
  UnauthorizedResponse,
} from '@app/shared/swagger/responses'
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  CreateWalletDto,
} from '@app/src/shared/auth/dto'
import { User, UserType } from '@app/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/shared/auth/guards'
import { ValidationPipe } from '@app/src/shared/validations'
import { SuccessRO } from '@app/shared/dto'
import { NonprofitAuthService } from './nonprofit-auth.service'
import { AuthLoginDto, NonprofitUserRO, AuthSignupDto } from './dto'
import { UserTypes } from '@app/src/shared/enums'
import { IRequestWithUser } from '@app/src/shared/interfaces'

@ApiTags('Auth Nonprofit')
@Controller('auth/nonprofit')
export class NonprofitAuthController {
  constructor(private readonly nonprofitAuthService: NonprofitAuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User login' })
  @ApiCreatedResponse({ type: NonprofitUserRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async login(@Body() payload: AuthLoginDto): Promise<NonprofitUserRO> {
    return this.nonprofitAuthService.login(payload)
  }

  @Post('signup')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User signup' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConflictResponse(ConflictResponse)
  async signup(@Body() payload: AuthSignupDto): Promise<SuccessRO> {
    return this.nonprofitAuthService.signup(payload)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @ApiOperation({ summary: 'User token' })
  @ApiOkResponse({ type: NonprofitUserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async me(@Req() request: IRequestWithUser, @User() user: any): Promise<NonprofitUserRO> {
    return this.nonprofitAuthService.me(user, request)
  }

  @Post('password/forgot')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User forgot password' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<SuccessRO> {
    return this.nonprofitAuthService.forgotPassword(email)
  }

  @Put('password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User change password' })
  @ApiOkResponse({ type: NonprofitUserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async changePassword(
    @Body() payload: ChangePasswordDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.nonprofitAuthService.changePassword(payload, userId)
  }

  @Patch('reset/password/:userId/:resetPasswordToken')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Reset user password' })
  @ApiOkResponse({ type: NonprofitUserRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async resetPassword(
    @Body() payload: ResetPasswordDto,
    @Param('userId') userId: string,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ): Promise<SuccessRO> {
    return this.nonprofitAuthService.resetPassword(payload, userId, resetPasswordToken)
  }

  @Put('wallet')
  @UseGuards(JwtAuthGuard)
  @UserType(UserTypes.NONPROFIT)
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: 'Create Nonprofit Wallet',
    description: 'If the Nonprofit does not have a wallet, create one',
  })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  async createWallet(
    @Body() payload: CreateWalletDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.nonprofitAuthService.createWallet(payload, userId)
  }
}
