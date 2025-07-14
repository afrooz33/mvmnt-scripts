import {
  Get,
  Body,
  Post,
  Patch,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Query,
  Param,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { DeliverySettingsService } from './delivery-settings.service'
import {
  QueryDto,
  CreateDeliverySettingDto,
  CalculateDeliveryDateDto,
  CreateUnattendedSettingDto,
  PublicShippingProfileQueryDto,
  ChangeDeliverySettingStatusDto,
} from './dto'
import { DeliverySettingsType } from './enums'

@ApiTags('Delivery Settings')
@Controller('users/delivery-settings')
export class DeliverySettingsController {
  constructor(private readonly deliverySettingsService: DeliverySettingsService) {}

  @Get('public/get/shipping-profile')
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'Public get shipping profile' })
  publicShippingProfile(@Query() query: PublicShippingProfileQueryDto) {
    return this.deliverySettingsService.publicShippingProfile(query)
  }

  @Get('public/calculate/delivery-date')
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'Public get delivery setting' })
  calculateDeliveryDate(@Query() query: CalculateDeliveryDateDto) {
    return this.deliverySettingsService.calculateDeliveryDate(query)
  }

  @Get('public/:type')
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'Public get delivery setting based on type' })
  @ApiParam({ name: 'type', enum: [DeliverySettingsType.UNATTENDED, DeliverySettingsType.GENERAL] })
  publicShow(@Param('type') type: string, @Param('id') user: string) {
    return this.deliverySettingsService.publicShow(type, user)
  }

  @Get()
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get delivery setting' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  show(@Query() query: QueryDto, @User('id') user: string) {
    return this.deliverySettingsService.show(query, user)
  }

  @Post('general')
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Create general delivery setting' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  create(@Body() payload: CreateDeliverySettingDto, @User('id') user: string) {
    return this.deliverySettingsService.upsertGeneralSetting(payload, user)
  }

  @Post('unattended')
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Create unattended delivery setting' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  createUnattended(@Body() payload: CreateUnattendedSettingDto, @User('id') user: string) {
    return this.deliverySettingsService.upsertUnattendedSetting(payload, user)
  }

  @Patch()
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Enable or disable delivery setting by type' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  changeStatus(@Body() payload: ChangeDeliverySettingStatusDto, @User('id') user: string) {
    return this.deliverySettingsService.changeStatus(payload, user)
  }
}
