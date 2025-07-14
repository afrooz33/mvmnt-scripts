import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
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
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { ICsvAgeGenderDonator, ICsvGenderDonator } from '@app/src/shared/interfaces'
import { DealType } from '@app/src/users/deal/enums'
import { AnalyticsService } from './analytics.service'
import { DateFilterQueryDto, MvmntDonationQueryDto, AgeGenderFilterQueryDto } from './dto'
import { FundraiserType } from '@app/src/re2/fundraisers/enums'

@ApiTags('Admin Analytics')
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin analytics - Summary top section statistics' })
  async show(@Query() query: DateFilterQueryDto): Promise<SuccessRO> {
    return this.analyticsService.topStats(query)
  }

  @Get('export/user/mvmnt-holder/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin analytics - Export user MVMNT holding ranking' })
  async exportUserHoldingRanking(@Query() query: DateFilterQueryDto): Promise<SuccessRO> {
    return this.analyticsService.userHoldingRanking(query, true)
  }

  @Get('user/mvmnt-holder/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin analytics - User MVMNT holding ranking' })
  async userHoldingRanking(@Query() query: DateFilterQueryDto): Promise<SuccessRO> {
    return this.analyticsService.userHoldingRanking(query)
  }

  @Get('chart/total-users')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin analytics - Total users' })
  async totalUser(@Query() query: DateFilterQueryDto): Promise<SuccessRO> {
    return this.analyticsService.chartTotalUser(query)
  }

  @Get('export/chart/total-users')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin analytics - Export total users' })
  async exportTotalUser(@Query() query: DateFilterQueryDto): Promise<SuccessRO> {
    return this.analyticsService.chartTotalUser(query, true)
  }

  @Get('chart/age-gender/donator')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin analytics - Age and gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async ageGenderDonator(@Query() query: AgeGenderFilterQueryDto): Promise<any> {
    return this.analyticsService.ageGenderDonator(query)
  }

  @Get('export/chart/age-gender/donator')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin analytics - Export age and gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportAgeGenderDonator(
    @Query() query: AgeGenderFilterQueryDto,
  ): Promise<ICsvAgeGenderDonator> {
    return this.analyticsService.ageGenderDonator(query, true)
  }

  @Get('chart/gender/donator')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async genderDonator(@Query() query: AgeGenderFilterQueryDto): Promise<any> {
    return this.analyticsService.genderDonator(query)
  }

  @Get('export/chart/gender/donator')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export gender (donator)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportGenderDonator(@Query() query: AgeGenderFilterQueryDto): Promise<ICsvGenderDonator> {
    return this.analyticsService.genderDonator(query)
  }

  @Get('deal/buyers/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Deal buyer rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async dealRanking(@Query() query: DateFilterQueryDto): Promise<PaginateRO> {
    return this.analyticsService.dealRanking(query)
  }

  @Get('export/deal/buyers/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Export deal buyer rankings' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDealRanking(@Query() query: DateFilterQueryDto): Promise<PaginateRO> {
    return this.analyticsService.dealRanking(query, true)
  }

  @Get('deal/sellers/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Deal seller rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async sellerRanking(@Query() query: DateFilterQueryDto): Promise<PaginateRO> {
    return this.analyticsService.sellerRanking(query)
  }

  @Get('export/deal/sellers/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Export deal seller rankings' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportSellerRanking(@Query() query: DateFilterQueryDto): Promise<any> {
    return this.analyticsService.sellerRanking(query, true)
  }

  @Get('deal/:deal_type/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Deal type rankings' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  async dealTypeRanking(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<PaginateRO> {
    return this.analyticsService.dealTypeRanking(deal_type, query)
  }

  @Get('export/deal/:deal_type/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Export deal type rankings' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  async exportDealTypeRanking(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<any> {
    return this.analyticsService.dealTypeRanking(deal_type, query, true)
  }

  @Get('chart/registration/activity')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - No. registration' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async registrationLog(@Query() query: DateFilterQueryDto): Promise<any> {
    return this.analyticsService.registrationActivity(query)
  }

  @Get('export/chart/registration/activity')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Export No. registration' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportregistrationLog(@Query() query: DateFilterQueryDto): Promise<any> {
    return this.analyticsService.registrationActivity(query, true)
  }

  @Get('chart/login/activity')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - No. login' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async loginLog(@Query() query: DateFilterQueryDto): Promise<any> {
    return this.analyticsService.loginActivity(query)
  }

  @Get('export/chart/login/activity')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Analytics - Export No. login' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportLoginLog(@Query() query: DateFilterQueryDto): Promise<any> {
    return this.analyticsService.loginActivity(query, true)
  }

  @Get('chart/:deal_type/number-of-participants')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - No. Participants (auction, buynow, raffle)',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
  })
  async totalParticipant(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<any> {
    return this.analyticsService.totalParticipant(deal_type, query)
  }

  @Get('export/chart/:deal_type/number-of-participants')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export No. Participants (auction, buynow, raffle)',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  async exportTotalParticipant(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<any> {
    return this.analyticsService.totalParticipant(deal_type, query, true)
  }

  @Get('chart/:deal_type/total-open-close-deals')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - No. Auctions (open/end) (auction, buynow, raffle)',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  async totalOpenCloseDeal(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<any> {
    return this.analyticsService.totalOpenCloseDeal(deal_type, query)
  }

  @Get('export/chart/:deal_type/total-open-close-deals')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export No. Auctions (open/end) (auction, buynow, raffle)',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  async exportTotalOpenCloseDeal(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<any> {
    return this.analyticsService.totalOpenCloseDeal(deal_type, query, true)
  }

  @Get('chart/:deal_type/total-sales')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - No. Sales (auction, buynow, raffle)',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  async totalSales(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<any> {
    return this.analyticsService.totalSales(deal_type, query)
  }

  @Get('export/chart/:deal_type/total-sales')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export No. Sales (auction, buynow, raffle)',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  async exportTotalSales(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
  ): Promise<any> {
    return this.analyticsService.totalSales(deal_type, query, true)
  }

  @Get('chart/:deal_type/category/ranking/:type')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - category ranking',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  @ApiParam({
    name: 'type',
    enum: ['price', 'user'],
  })
  async categoryRanking(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
    @Param('type') type: string,
  ): Promise<any> {
    return this.analyticsService.categoryRanking(deal_type, query, type)
  }

  @Get('export/chart/:deal_type/category/ranking/:type')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export category ranking',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({
    name: 'deal_type',
    enum: DealType,
    description: 'AUCTION, BUYNOW, RAFFLE',
  })
  @ApiParam({
    name: 'type',
    enum: ['price', 'user'],
  })
  async exportCategoryRanking(
    @Query() query: DateFilterQueryDto,
    @Param('deal_type') deal_type: DealType,
    @Param('type') type: string,
  ): Promise<any> {
    return this.analyticsService.categoryRanking(deal_type, query, type, true)
  }

  @Get('mvmnt/chart/total-donation')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Donation (MVMNT) Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async totalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.totalMvmntDonation(query)
  }

  @Get('export/mvmnt/chart/total-donation')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Donation (MVMNT) Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportTotalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.totalMvmntDonation(query, true)
  }

  @Get('mvmnt/chart/category/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Donation (MVMNT) Category Ranking',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async mvmntCategoryRanking(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.categoryRanking('all', query, 'price')
  }

  @Get('export/mvmnt/chart/category/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Donation (MVMNT) Category Ranking',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportMvmntCategoryRanking(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.categoryRanking('all', query, 'price', true)
  }

  @Get('mvmnt/chart/category/donation/participant')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Donation (MVMNT) Category Donation & Participant',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async categoryDonationParticipant(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.categoryDonationParticipant(query)
  }

  @Get('export/mvmnt/chart/category/donation/participant')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Donation (MVMNT) Category Donation & Participant',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportCategoryDonationParticipant(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.categoryDonationParticipant(query, true)
  }

  @Get('mvmnt/nonprofit/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Donation (MVMNT) Nonprofit Ranking',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async nonprofitRanking(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.nonprofitRanking(query)
  }

  @Get('export/mvmnt/nonprofit/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Donation (MVMNT) Nonprofit Ranking',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportNonprofitRanking(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.nonprofitRanking(query, true)
  }

  @Get('re2/chart/fundraiser/:type')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - No. of fundraiser (open/ended)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({
    name: 'type',
    enum: FundraiserType,
  })
  async fundraiserRanking(
    @Query() query: MvmntDonationQueryDto,
    @Param('type') type: FundraiserType,
  ): Promise<any> {
    return this.analyticsService.fundraiserRanking(query, type)
  }

  @Get('export/re2/chart/fundraiser/:type')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export No. of fundraiser (open/ended)',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({
    name: 'type',
    enum: FundraiserType,
  })
  async exportFundraiserRanking(
    @Query() query: MvmntDonationQueryDto,
    @Param('type') type: FundraiserType,
  ): Promise<any> {
    return this.analyticsService.fundraiserRanking(query, type, true)
  }

  @Get('re2/chart/fundraiser/total-donation/:type')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Fundraiser Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({
    name: 'type',
    enum: FundraiserType,
  })
  async fundraiserTotalDonation(
    @Query() query: MvmntDonationQueryDto,
    @Param('type') type: FundraiserType,
  ): Promise<any> {
    return this.analyticsService.fundraiserTotalDonation(query, type)
  }

  @Get('export/re2/chart/fundraiser/total-donation/:type')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Fundraiser Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({
    name: 'type',
    enum: FundraiserType,
  })
  async exportFundraiserTotalDonation(
    @Query() query: MvmntDonationQueryDto,
    @Param('type') type: FundraiserType,
  ): Promise<any> {
    return this.analyticsService.fundraiserTotalDonation(query, type, true)
  }

  @Get('re2/chart/total-donation')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async re2TotalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.re2TotalDonation(query)
  }

  @Get('export/re2/chart/total-donation')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportRe2TotalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.re2TotalDonation(query, true)
  }

  @Get('re2/chart/integration/shopify')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Integration Shopify',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async integrationShopify(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.integrationShopify(query)
  }

  @Get('export/re2/chart/integration/shopify')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Integration Shopify',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportIntegrationShopify(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.integrationShopify(query, true)
  }

  @Get('re2/chart/integration/total-donation/shopify')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Integration Shopify Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async shopifyTotalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.shopifyTotalDonation(query)
  }

  @Get('export/re2/chart/integration/total-donation/shopify')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Integration Shopify Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportShopifyTotalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.shopifyTotalDonation(query, true)
  }

  @Get('re2/chart/integration/all/donation')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Integration Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async integrationTotalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.integrationTotalDonation(query)
  }

  @Get('export/re2/chart/integration/all/donation')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Integration Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportIntegrationTotalDonation(@Query() query: MvmntDonationQueryDto): Promise<any> {
    return this.analyticsService.integrationTotalDonation(query, true)
  }

  @Get('re2/integration/fundraiser/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Integration Fundraiser Ranking',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async integrationFundraiserRanking(@Query() query: DateFilterQueryDto): Promise<any> {
    return this.analyticsService.integrationFundraiserRanking(query)
  }

  @Get('export/re2/integration/fundraiser/ranking')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin Analytics - Export Integration Total Donation',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportIntegrationFundraiserRanking(@Query() query: DateFilterQueryDto): Promise<any> {
    return this.analyticsService.integrationFundraiserRanking(query, true)
  }
}
