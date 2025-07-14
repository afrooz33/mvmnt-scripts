import { Response } from 'express'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  Res,
  Get,
  Put,
  Body,
  Post,
  Param,
  Query,
  Delete,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { DeleteRecordDto, PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { CouponsEntity } from '@app/src/admin/coupons/entities/coupons.entity'
import { CouponsService } from './coupons.service'
import {
  QueryDto,
  ZoneQueryDto,
  CouponCodeDto,
  CreateCouponDto,
  UpdateCouponDto,
  GetDealsQueryDto,
  ApplyCodeQueryDto,
} from './dto'

@Controller('coupons')
@ApiTags('User Coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('applicable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coupons eligible for user' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: [CouponsEntity] })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Coupon not found'))
  async eligibleCoupons(@User('id') userId: string): Promise<CouponsEntity[]> {
    return this.couponsService.eligibleCoupons(userId)
  }

  @Get('get/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users by username' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: [CouponsEntity] })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  async searchUsers(@Query('username') username: string): Promise<any> {
    return this.couponsService.searchUsers(username)
  }

  @Get('get/deals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get all deals' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  async getDeals(@Query() query: GetDealsQueryDto, @User('id') userId: string): Promise<any> {
    return this.couponsService.getDeals(query, userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coupons created by user' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: [CouponsEntity] })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Coupon not found'))
  async show(@Query() query: QueryDto, @User('id') userId: string): Promise<PaginateRO> {
    return this.couponsService.show(query, userId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon detail' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: [CouponsEntity] })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Coupon not found'))
  async showOne(@Param('id') id: string, @User('id') userId: string): Promise<CouponsEntity> {
    return this.couponsService.showOne(id, userId)
  }

  @Get('shipping/zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all user's shipping country" })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: [CouponsEntity] })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Shipping zone not found'))
  async showZones(@User('id') userId: string, @Query() query: ZoneQueryDto): Promise<any> {
    return this.couponsService.showZones(query, userId)
  }

  @Get('validate/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate coupon code' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Coupon not found'))
  async validate(@Param('code') code: string, @User('id') userId: string): Promise<SuccessRO> {
    return this.couponsService.validate(userId, code)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create discount coupon' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async create(@Body() payload: CreateCouponDto, @User('id') userId: string): Promise<SuccessRO> {
    return this.couponsService.create(payload, userId)
  }

  @Put(':id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicate discount coupon' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async duplicate(@Param('id') id: string, @User('id') userId: string): Promise<SuccessRO> {
    return this.couponsService.duplicate(id, userId)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update discount coupon' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async updateOne(
    @Param('id') id: string,
    @User('id') userId: string,
    @Body() payload: UpdateCouponDto,
  ): Promise<SuccessRO> {
    return this.couponsService.updateOne(id, payload, userId)
  }

  @Get('apply/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply coupon code to the deal' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async applyCode(
    @Query() query: ApplyCodeQueryDto,
    @Param('code') code: string,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.couponsService.applyCode(query, code, userId)
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple discount coupons' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async deleteCoupons(
    @Body() payload: DeleteRecordDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.couponsService.delete(payload, userId)
  }

  @Delete(':cartId/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove coupon code from the cart' })
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async removeCode(
    @Param('cartId') cartId: string,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.couponsService.removeCode(cartId, userId)
  }

  @Post('save/coupon/code')
  @ApiOperation({ summary: 'Save discount coupon code in cookie' })
  async invite(@Res() res: Response, @Body() payload: CouponCodeDto): Promise<any> {
    return this.couponsService.setCookie(res, payload)
  }
}
