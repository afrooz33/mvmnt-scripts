import { Throttle } from '@nestjs/throttler'
import { Body, Controller, Get, Post, Put, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ValidationPipe } from '@app/src/shared/validations'
import { Roles, User, UserType } from '@app/src/shared/auth/decorators'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { SuccessRO } from '@app/src/shared/dto'
import { Role, UserTypes } from '@app/src/shared/enums'
import { ChangePasswordDto, CreateWalletDto } from '@app/src/shared/auth/dto'
import { AdminLoginDto } from '@app/src/admin/auth/dto'
import { AdminUserRO } from '@app/src/admin/auth/dto/AdminUserRO'
import { AuthService } from './auth.service'

@ApiTags('Auth Admin')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin user login' })
  @ApiCreatedResponse({ type: AdminUserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('Admin user does not exist'))
  async login(@Body() payload: AdminLoginDto): Promise<AdminUserRO> {
    return this.authService.login(payload)
  }

  @Get('me')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin token' })
  @ApiOkResponse({ type: AdminUserRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('Admin user does not exist'))
  async me(@User('id') userId: string): Promise<AdminUserRO> {
    return this.authService.me(userId)
  }

  @Put('password')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin change password' })
  @ApiOkResponse({ type: AdminUserRO })
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

  @Put('wallet')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UserType(UserTypes.ADMIN)
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: 'Create admin Wallet',
    description: 'If the admin does not have a wallet, create it',
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
