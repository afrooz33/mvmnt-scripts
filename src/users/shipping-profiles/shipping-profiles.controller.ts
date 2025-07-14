import {
  Body,
  Get,
  Post,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Param,
  Put,
  Delete,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { ShippingProfilesService } from './shipping-profiles.service'
import { QueryDto, CreateShippingProfileDto, UpdateShippingProfileDto } from './dto'

@ApiTags('User shipping-profiles')
@Controller('user/shipping-profiles')
export class ShippingProfilesController {
  constructor(private readonly shippingProfilesService: ShippingProfilesService) {}

  @Get('applicable/deal')
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
  @ApiQuery({ name: 'deal', required: false, type: String })
  @ApiQuery({ name: 'variant', required: false, type: String })
  @ApiNotFoundResponse(GetResponse('Shipping profile does not exist'))
  @ApiOperation({ summary: 'Get shipping profile applicable to a deal' })
  applicableToDeal(
    @Query('deal') deal: string,
    @User('id') user: string,
    @Query('variant') variant: string,
  ) {
    return this.shippingProfilesService.applicableToDeal(user, deal, variant)
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
  @ApiOperation({ summary: 'List all shipping profile of the user' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  show(@Query() query: QueryDto, @User('id') user: string) {
    return this.shippingProfilesService.show(query, user)
  }

  @Get(':id/zones')
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
  @ApiOperation({ summary: 'List all shipping profile zones' })
  @ApiNotFoundResponse(GetResponse('Shipping profile does not exist'))
  showZones(@Param('id') id: string, @User('id') user: string) {
    return this.shippingProfilesService.showZones(id, user)
  }

  @Get(':id')
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
  @ApiOperation({ summary: 'List shipping profile of the user' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  showOne(@Param('id') id: string, @User('id') user: string) {
    return this.shippingProfilesService.showOne(id, user)
  }

  @Post()
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
  @ApiOperation({ summary: 'Create shipping profile of the user' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  create(@Body(new ValidationPipe()) payload: CreateShippingProfileDto, @User('id') user: string) {
    return this.shippingProfilesService.create(payload, user)
  }

  @Put()
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
  @ApiOperation({ summary: 'Update shipping profile of the user' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  updateOne(@Body() payload: UpdateShippingProfileDto, @User('id') user: string) {
    return this.shippingProfilesService.update(payload, user)
  }

  @Get('get/multiple/origins')
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
  @ApiOperation({ summary: 'Get origins for shipping profiles' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  @ApiQuery({ name: 'shippingProfileIds', required: true, isArray: true, type: String })
  getOrigins(@Query('shippingProfileIds') shippingProfileIds: string[], @User('id') user: string) {
    return this.shippingProfilesService.getOrigins(shippingProfileIds, user)
  }

  @Get('get/deals')
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
  @ApiOperation({ summary: 'Get all deals for shipping profile' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  getDeals(@Query() query: QueryDto, @User('id') user: string) {
    return this.shippingProfilesService.getDeals(query, user)
  }

  @Delete(':id')
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
  @ApiOperation({ summary: 'Delete shipping profile' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  delete(@Param('id') id: string, @User('id') user: string) {
    return this.shippingProfilesService.delete(id, user)
  }
}
