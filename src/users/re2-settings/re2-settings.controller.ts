import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Get, Controller, UseGuards, Param, Query, Put } from '@nestjs/common'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { Re2SettingsService } from './re2-settings.service'

@ApiTags('Users Re2 Settings')
@Controller('users/re2-settings')
export class Re2SettingsController {
  constructor(private readonly re2SettingsService: Re2SettingsService) {}

  @Get(':action/sync/re2/donations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Enable/Disable sync RE2 donations' })
  @ApiParam({ name: 'action', type: String, enum: ['enable', 'disable'], required: true })
  change(@User('id') userId: string, @Param('action') action: string) {
    return this.re2SettingsService.change(userId, action)
  }

  @Get('donation/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get Re2 donation history' })
  history(@Query() query: MyPaginateDto, @User('id') userId: string) {
    return this.re2SettingsService.history(query, userId)
  }

  @Put('manual/integration/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Manually integrate a donation from RE2' })
  manualIntegration(@Param('code') code: string, @User('id') userId: string) {
    return this.re2SettingsService.manualIntegration(code, userId)
  }
}
