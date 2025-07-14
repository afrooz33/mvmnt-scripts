import { Throttle } from '@nestjs/throttler'
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  ConflictResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { SuccessRO } from '@app/src/shared/dto'
import {
  AuthLoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@app/src/shared/auth/dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard } from '@app/src/shared/auth/guards'
import { SignupDto, UserRO } from '@app/src/re2/auth/dto'
import { AuthService } from '@app/src/re2/auth/auth.service'
import { CreateWalletDto } from '@app/src/shared/auth/dto/create-wallet.dto'
import { UserTypes } from '@app/src/shared/enums'

@ApiTags('Auth RE2')
@Controller('re2/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User login' })
  @ApiCreatedResponse({ type: UserRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async login(@Body() payload: AuthLoginDto): Promise<UserRO> {
    return this.authService.login(payload)
  }

  @Post('signup')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User signup' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConflictResponse(ConflictResponse)
  async signup(@Body() payload: SignupDto): Promise<SuccessRO> {
    return this.authService.signup(payload)
  }

  @Post('password/forgot')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User forgot password' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async forgotPassword(@Body() { email }: ForgotPasswordDto): Promise<SuccessRO> {
    return this.authService.forgotPassword(email)
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User change password' })
  @ApiOkResponse({ type: UserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async changePassword(
    @Body() payload: ChangePasswordDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.authService.changePassword(payload, userId)
  }

  @Patch('reset/password/:userId/:resetPasswordToken')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Reset user password' })
  @ApiOkResponse({ type: UserRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async resetPassword(
    @Body() payload: ResetPasswordDto,
    @Param('userId') userId: string,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ): Promise<SuccessRO> {
    return this.authService.resetPassword(payload, userId, resetPasswordToken)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User profile' })
  @ApiOkResponse({ type: UserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async check(@User() user: any): Promise<UserRO> {
    return this.authService.me(user)
  }

  @Put('wallet')
  @UseGuards(JwtAuthGuard)
  @UserType(UserTypes.RE2)
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: 'Create Re2 Wallet',
    description: 'If the Re2 does not have a wallet, create one',
  })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  async createWallet(
    @Body() payload: CreateWalletDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.authService.createWallet(payload, userId)
  }
}
