import { Controller, Get, UseGuards, ValidationPipe, Query } from '@nestjs/common'
import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiTags,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import {
  ICsvDonationProjectRanking,
  ICsvDonorRanking,
  ICsvGenderDonator,
  ICsvAgeGenderDonator,
} from '@app/src/shared/interfaces'
import { AnalyticsService } from './analytics.service'
import { DateFilterQueryDto } from './dto'

@ApiTags('Nonprofit Analytics')
@Controller('nonprofit/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - Summary top section statistics' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.analyticsService.show(query, userId)
  }

  @Get('deal/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - Deal rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async dealRanking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.analyticsService.dealRanking(query, userId)
  }

  @Get('export/deal/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - Export Deal rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDealRanking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.analyticsService.exportDealRanking(query, userId)
  }

  @Get('donation-project/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - Donation project rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donationProjectRanking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.analyticsService.donationProjectRanking(query, userId)
  }

  @Get('export/donation-project/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - Export donation project rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationProjectRanking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<ICsvDonationProjectRanking> {
    return this.analyticsService.donationProjectRanking(query, userId, true)
  }

  @Get('donated-user/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - Donor rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async userRanking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.analyticsService.userRanking(query, userId)
  }

  @Get('export/donated-user/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - Export donor rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportUserRanking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<ICsvDonorRanking> {
    return this.analyticsService.exportUserRanking(query, userId)
  }

  @Get('chart/total-donation/deal')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Analytics - Total donation per deal types and RE2',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async totalDonation(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<any> {
    return this.analyticsService.totalDonation(query, userId)
  }

  @Get('chart/total-donation/category')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Analytics - Total donation per category',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async totalDonationCategory(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<any> {
    return this.analyticsService.totalDonationCategory(query, userId)
  }

  @Get('chart/gender/donator')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Analytics - Gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async genderDonator(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<ICsvDonorRanking> {
    return this.analyticsService.genderDonator(query, userId)
  }

  @Get('export/chart/gender/donator')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Analytics - Export gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportGenderDonator(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<ICsvGenderDonator> {
    return this.analyticsService.genderDonator(query, userId, true)
  }

  @Get('chart/age-gender/donator')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Analytics - Age and gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async ageGenderDonator(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<ICsvDonorRanking> {
    return this.analyticsService.ageGenderDonator(query, userId)
  }

  @Get('export/chart/age-gender/donator')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Analytics - Export age and gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportAgeGenderDonator(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<ICsvAgeGenderDonator> {
    return this.analyticsService.ageGenderDonator(query, userId, true)
  }

  @Get('re2/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - RE2 rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async re2Ranking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.analyticsService.re2Ranking(query, userId)
  }

  @Get('export/re2/ranking')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Analytics - RE2 rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportRe2Ranking(
    @Query(new ValidationPipe()) query: DateFilterQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.analyticsService.re2Ranking(query, userId, true)
  }
}
