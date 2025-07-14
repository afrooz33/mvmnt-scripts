import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger'
import { Get, Query, UsePipes, UseGuards, Controller, ValidationPipe, Param } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { AnalyticsService } from './analytics.service'
import { Re2AnalyticQueryDto, Re2ContributorQueryDto } from './dto'

@ApiTags('RE2 Analytics')
@Controller('re2/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - Top summary' })
  topSummary(@Query() query: Re2AnalyticQueryDto, @User('id') userId: string) {
    return this.analyticsService.topSummary(query, userId)
  }

  @Get('summary/chart/donations')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - Summary chart donations' })
  summaryDonations(@Query() query: Re2AnalyticQueryDto, @User('id') userId: string) {
    return this.analyticsService.summaryDonations(query, userId)
  }

  @Get('summary/chart/total/donations')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - Summary chart total donations' })
  summaryTotalDonations(@Query() query: Re2AnalyticQueryDto, @User('id') userId: string) {
    return this.analyticsService.summaryTotalDonations(query, userId)
  }

  @Get('summary/donated/nonprofit')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - Summary donated nonprofits' })
  summaryDonatedNonprofits(@Query() query: Re2AnalyticQueryDto, @User('id') userId: string) {
    return this.analyticsService.summaryDonatedNonprofits(query, userId)
  }

  @Get('summary/donated/donation-projects')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - Summary donated donation projects' })
  summaryDonatedDonationProjects(@Query() query: Re2AnalyticQueryDto, @User('id') userId: string) {
    return this.analyticsService.summaryDonatedDonationProjects(query, userId)
  }

  @Get('summary/list/:receiver/donation-sources/:id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - Summary donated donation sources' })
  @ApiParam({
    required: true,
    name: 'receiver',
    description: 'Either nonprofit or donation_project',
    enum: ['nonprofit', 'donation_project'],
  })
  summaryDonationSources(
    @Param('id') id: string,
    @User('id') userId: string,
    @Query() query: Re2AnalyticQueryDto,
    @Param('receiver') receiver: 'nonprofit' | 'donation_project',
  ) {
    return this.analyticsService.summaryDonationSources(id, receiver, query, userId)
  }

  @Get('list/fundraiser/:id/contributors')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - List of contributors for a fundraiser' })
  listFundraiserContributors(
    @Param('id') id: string,
    @User('id') userId: string,
    @Query() query: Re2AnalyticQueryDto,
  ) {
    return this.analyticsService.listFundraiserContributors(id, query, userId)
  }

  @Get('list/fundraiser')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - List fundraisers' })
  listFundraisers(@Query() query: Re2AnalyticQueryDto, @User('id') userId: string) {
    return this.analyticsService.listFundraisers(query, userId)
  }

  @Get('list/integration/:id/contributors')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - List of contributors for a integration' })
  listIntegrationContributors(
    @Param('id') id: string,
    @User('id') userId: string,
    @Query() query: Re2AnalyticQueryDto,
  ) {
    return this.analyticsService.listIntegrationContributors(id, query, userId)
  }

  @Get('list/integration')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - List integrations' })
  listIntegrations(@Query() query: Re2AnalyticQueryDto, @User('id') userId: string) {
    return this.analyticsService.listIntegrations(query, userId)
  }

  @Get('list/:id/contributors')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  @ApiOperation({ summary: 'RE2 analytics - List contributors for re2 source' })
  listContributors(@Query() query: Re2ContributorQueryDto, @User('id') userId: string) {
    return this.analyticsService.listContributors(query, userId)
  }
}
