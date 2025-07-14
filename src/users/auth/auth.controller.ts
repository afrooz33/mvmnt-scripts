import { Request, Response } from 'express'
import { Throttle } from '@nestjs/throttler'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger'
import {
  Get,
  Put,
  Req,
  Res,
  Body,
  Post,
  Param,
  Patch,
  Query,
  Delete,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { decodeCookieService } from '@app/src/shared/services'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { User, UserType, SkipAuth } from '@app/src/shared/auth/decorators'
import {
  CreateWalletDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  ChangePasswordDto,
} from '@app/src/shared/auth/dto'
import {
  GetResponse,
  ConflictResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { AuthService } from './auth.service'
import {
  UserRO,
  UserLoginDto,
  UserSignupDto,
  SocialLoginDto,
  TwoFactorAuthRO,
  VerifyTwoAuthDto,
  EnableTwoAuthDto,
  NonprofitSignupDto,
} from './dto'
import { UserSocialLogin } from './services'
import { SocialLoginProvider } from './enums'

@ApiTags('Auth users')
@Controller('auth/users')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly socialLoginService: UserSocialLogin,
  ) {}

  @SkipAuth()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Get a new access token using a refresh token' })
  @ApiOkResponse({ description: 'Returns a new access token.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.refreshToken(req, res)
    return res.json(tokens)
  }

  @SkipAuth()
  @Post('logout')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User logout and invalidate refresh token' })
  @ApiOkResponse({ type: SuccessRO })
  async logout(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const result = await this.authService.logout(req, res)
    return res.json(result)
  }

  @Delete('social/:provider/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Remove a Social Login' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiParam({ name: 'provider', enum: SocialLoginProvider })
  async removeSocialLogin(
    @User('id') userId: string,
    @Param('provider') provider: SocialLoginProvider,
  ): Promise<SuccessRO> {
    return this.socialLoginService.removeSocialLogin(userId, provider)
  }

  @Post('social/add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Add a Social Login' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  async addSocialLogin(
    @User('id') userId: string,
    @Body() payload: SocialLoginDto,
  ): Promise<SuccessRO> {
    return this.socialLoginService.addSocialLogin(userId, payload)
  }

  @Post('social/login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Login via Social Media' })
  @ApiCreatedResponse({ type: UserRO })
  @ApiBadRequestResponse(BadRequestResponse)
  async socialLogin(@Req() req: Request, @Body() payload: SocialLoginDto): Promise<SuccessRO> {
    const xGuestCartId = await decodeCookieService(req, 'xGuestCartId')
    return this.socialLoginService.loginSocial(payload, xGuestCartId)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User login' })
  @ApiCreatedResponse({ type: UserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async login(
    @Body() payload: UserLoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.login(payload, req, res)
    return res.json(result)
  }

  @Post('signup')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User signup' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConflictResponse(ConflictResponse)
  async signup(
    @Body() payload: UserSignupDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.signup(payload, req, res)
    return res.json(result)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User profile' })
  @ApiOkResponse({ type: UserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async check(@User('id') userId: string): Promise<UserRO> {
    return this.authService.me(userId)
  }

  @Get('email-confirmation/:userId')
  @ApiOperation({ summary: 'User email confirmation' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async confirmation(
    @Param('userId') userId: string,
    @Query('token') token: string,
  ): Promise<SuccessRO> {
    return this.authService.confirmation(userId, token)
  }

  @Put('wallet')
  @UseGuards(JwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: 'Create User Wallet',
    description: 'If the User does not have a wallet, create one',
  })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  async createWallet(
    @Body() payload: CreateWalletDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.authService.createWallet(payload, userId)
  }

  @Get('nonprofit-verification/:userId')
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: "Nonprofit's user account confirmation" })
  async nonprofitConfirmation(
    @Param('userId') userId: string,
    @Query('token') token: string,
    @Query('nonprofit') nonprofit: string,
  ): Promise<SuccessRO> {
    return this.authService.nonprofitConfirmation(userId, token, nonprofit)
  }

  @Get('2fa/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: TwoFactorAuthRO })
  @ApiOperation({ summary: 'Enable 2FA and get qr code' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async initiate2FaAuth(@User('id') id: string, @User('email') email: string): Promise<void> {
    return this.authService.initiate2FaAuth(id, email)
  }

  @Put('2fa/enable')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Enable 2FA and get qr code' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async enable2FaAuth(@User('id') id: string, @Body() payload: EnableTwoAuthDto): Promise<void> {
    return this.authService.enable2FaAuth(id, payload)
  }

  @Put('2fa/remove')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async remove2FaAuth(@User('id') id: string): Promise<void> {
    return this.authService.remove2FaAuth(id)
  }

  @Post('2fa/verify')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Verify 2FA' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConflictResponse(ConflictResponse)
  async verify2Fa(
    @Body() payload: VerifyTwoAuthDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.verify2FaAuth(payload, req, res)
    return res.json(result)
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

  @Put('change/password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
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

  @Get('resend/email-confirmation/:userId')
  @ApiOperation({ summary: 'Resend user email confirmation' })
  @UsePipes(new ValidationPipe())
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async resendConfirmation(@Param('userId') userId: string): Promise<SuccessRO> {
    return this.authService.resendConfirmation(userId)
  }

  @Post('signup/nonprofit/user')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Signup nonprofit as user' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConflictResponse(ConflictResponse)
  async nonprofitSignup(@Body() payload: NonprofitSignupDto): Promise<SuccessRO> {
    return this.authService.nonprofitSignup(payload)
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions for the user' })
  @ApiOkResponse({ description: 'Returns list of active sessions' })
  async getActiveSessions(@User('id') userId: string) {
    return this.authService.getActiveSessions(userId)
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from specific session' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiParam({ name: 'sessionId', type: 'string' })
  async logoutSession(
    @User('id') userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<SuccessRO> {
    return this.authService.logoutSession(userId, sessionId)
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiOkResponse({ type: SuccessRO })
  async logoutAllDevices(
    @User('id') userId: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.logoutAllDevices(userId)
    res.clearCookie('refresh_token')
    return res.json(result)
  }
}
