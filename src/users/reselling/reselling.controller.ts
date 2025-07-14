import {
  Req,
  Res,
  Get,
  Post,
  Body,
  Query,
  Param,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Patch,
} from '@nestjs/common'
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { ConfigService } from '@nestjs/config'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { ResellingService } from './reselling.service'
import { ResellingRewardService } from './reselling-reward.service'
import { ResellerSellerQuery, ResellingStarRewardType } from './enums'
import {
  AddMemoDto,
  BanResellerDto,
  ApprovePayoutDto,
  ReinstateResellerDto,
  QueryRewardHistoryDto,
  SellerMonthPaidHistoryDto,
} from './dto'

@ApiTags('Users Reselling')
@Controller('users/reselling')
export class ResellingController {
  constructor(
    private readonly resellingService: ResellingService,
    private readonly resellingRewardsService: ResellingRewardService,
    private readonly configService: ConfigService,
  ) {}

  @Post(':dealId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Create a new reselling link' })
  @ApiNotFoundResponse(GetResponse('User/deal does not exist'))
  create(@Param('dealId') dealId: string, @User('id') userId: string) {
    return this.resellingService.create(userId, dealId)
  }

  @Get(':token/verify')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Reselling link verification with redirect' })
  @ApiNotFoundResponse(GetResponse('Reselling link not found'))
  async verify(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
    @User('id') userId?: string,
  ) {
    const resellingLink = await this.resellingService.verify(token, req, res, userId)

    const redirectUrl = `${this.configService.get('app.userDashboard')}/deals/${
      resellingLink.deal.id
    }`

    return res.redirect(redirectUrl)
  }

  @Get(':uniqueToken')
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get reselling link details' })
  @ApiNotFoundResponse(GetResponse('Reselling link not found'))
  async handleResellingLink(@Param('uniqueToken') uniqueToken: string) {
    return this.resellingService.show(uniqueToken)
  }

  @Get('conversion-rate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get conversion rate for user reselling links' })
  @ApiNotFoundResponse(GetResponse('User or Reselling links not found'))
  async getUserConversionRate(
    @User('id') userId: string,
    @Query() dealId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('token') token?: string,
  ) {
    return this.resellingService.getConversionRate(userId, dealId, startDate, endDate, token)
  }

  @Get('/overall-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get overall stats for user reselling links' })
  @ApiNotFoundResponse(GetResponse('User or Reselling links not found'))
  async getUserOverallStats(
    @User('id') userId: string,
    @Query('deal') dealId?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('token') token?: string,
  ) {
    return this.resellingService.getOverallStats(userId, dealId, startDate, endDate, token)
  }

  /** Star and Point rewards api */
  @Get('point/rewards/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get point rewards history for user' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async getPointHistory(@Query() query: QueryRewardHistoryDto, @User('id') userId: string) {
    return this.resellingRewardsService.getPointHistory(query, userId)
  }

  @Get('star/rewards/history/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get rewards history for user' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({ name: 'type', enum: Object.values(ResellingStarRewardType) })
  async getStarHistory(
    @Query() query: QueryRewardHistoryDto,
    @User('id') userId: string,
    @Param('type') type: ResellingStarRewardType,
  ) {
    return this.resellingRewardsService.getStarHistory(query, userId, type)
  }

  @Post('seller/approve/payout')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Seller approve payout' })
  async approvePayout(@User('id') userId: string, @Body() payload: ApprovePayoutDto) {
    return this.resellingRewardsService.approvePayout(payload, userId)
  }

  @Post('seller/reinstate/reseller')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Seller reinstate reseller' })
  async reinstateReseller(@User('id') userId: string, @Body() payload: ReinstateResellerDto) {
    return this.resellingRewardsService.reinstateReseller(payload, userId)
  }

  @Get('seller/banned/reseller')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Seller get banned reseller' })
  async showBannedReseller(@User('id') userId: string, @Query() body: MyPaginateDto) {
    return this.resellingRewardsService.showBannedReseller(body, userId)
  }

  @Post('seller/ban/reseller')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Seller ban reseller' })
  async banReseller(@User('id') userId: string, @Body() payload: BanResellerDto) {
    return this.resellingRewardsService.banReseller(payload, userId)
  }

  @Get('seller/paid/history/by/month')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get seller paid reselling fee history per month' })
  async sellerMonthPaidHistory(
    @User('id') userId: string,
    @Query() query: SellerMonthPaidHistoryDto,
  ) {
    return this.resellingRewardsService.sellerMonthPaidHistory(query, userId)
  }

  @Get('seller/paid/history')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get seller paid reselling fee history' })
  async sellerPaidHistory(@User('id') userId: string, @Query() query: MyPaginateDto) {
    return this.resellingRewardsService.sellerPaidHistory(query, userId)
  }

  @Get('seller/:type/history')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiParam({ name: 'type', enum: Object.values(ResellerSellerQuery) })
  @ApiOperation({ summary: 'Get seller pending reselling fee history' })
  async sellerHistory(
    @User('id') userId: string,
    @Query() query: MyPaginateDto,
    @Param('type') type: ResellerSellerQuery,
  ) {
    return this.resellingRewardsService.sellerHistory(query, userId, type)
  }

  @Get('show/:id/memo')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get memo for pending reselling fee' })
  async showMemo(
    @User('id') userId: string,
    @Query() query: MyPaginateDto,
    @Param('id') id: string,
  ) {
    return this.resellingRewardsService.showMemo(id, query, userId)
  }

  @Post('add/memo')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Add/update memo for pending reselling fee' })
  async addMemo(@User('id') userId: string, @Body() payload: AddMemoDto) {
    return this.resellingRewardsService.addMemo(payload, userId)
  }

  @Patch('reject/reward')
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
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Reject pending reselling fee' })
  async rejectReward(@User('id') userId: string, @Body() payload: AddMemoDto) {
    return this.resellingRewardsService.rejectReward(payload, userId)
  }
}
