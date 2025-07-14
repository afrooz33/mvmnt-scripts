import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { UserPointsService } from './user-points.service'
import { SuccessRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'

@ApiTags('User Points')
@Controller('user/points')
export class UserPointsController {
  constructor(private readonly userPointsService: UserPointsService) {}

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Points History for a User' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async history(@Query() query: MyPaginateDto, @User('id') userId: string): Promise<SuccessRO> {
    return await this.userPointsService.pointsHistory(query, userId)
  }

  @Get('effective-date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get effective date for points' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async effectiveDate(
    @Query() query: MyPaginateDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return await this.userPointsService.effectiveDate(query, userId)
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Pending Points for a User' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async pendingPoints(
    @Query() query: MyPaginateDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return await this.userPointsService.pendingPoints(query, userId)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Withdrawable Points for a User' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async get(@User('id') userId: string): Promise<SuccessRO> {
    return await this.userPointsService.getUserPoints(userId)
  }
}
