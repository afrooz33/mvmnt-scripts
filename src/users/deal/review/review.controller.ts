import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
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
  Get,
  Post,
  Body,
  Param,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { FilterDeleted } from '@app/src/shared/decorators'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { DealReviewService } from './review.service'
import { QueryDto, ReportReviewDto, ListReviewQueryDto, CreateReviewDto } from './dto'

@ApiTags('Deal Review')
@Controller('user/deal/reviews')
export class DealReviewController {
  constructor(private readonly dealReviewService: DealReviewService) {}

  @Get('list/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Get list pending reviews' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async listPendingReviews(
    @Query() query: MyPaginateDto,
    @User('id') user: string,
  ): Promise<PaginateRO> {
    return this.dealReviewService.listPendingReviews(query, user)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Get/filter deal review' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
    @User('id') user: string,
  ): Promise<PaginateRO> {
    return this.dealReviewService.show(query, user)
  }

  @Get(':dealId/public')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Public APi to get deal review by deal id' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async publicReview(
    @Query(new FilterDeleted(), new ValidationPipe()) query: MyPaginateDto,
    @Param('dealId') deal: string,
  ): Promise<PaginateRO> {
    return this.dealReviewService.publicReview(query, deal)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Purchased deals review' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  create(@Body() payload: CreateReviewDto, @User() user: any) {
    return this.dealReviewService.create(payload, user)
  }

  @Post(':reviewId/reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Report deal review' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  report(
    @Body() payload: ReportReviewDto,
    @User('id') userId: string,
    @Param('reviewId') reviewId: string,
  ) {
    return this.dealReviewService.report(payload, userId, reviewId)
  }

  @Get('all/public/reviews')
  @ApiOperation({
    summary: 'Public APi to get all reviews of deals created by user',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  publicAllReview(@Query(new ValidationPipe()) query: ListReviewQueryDto) {
    return this.dealReviewService.listReview(query)
  }

  @Get(':userId/public/review/stats')
  @ApiOperation({
    summary: 'Public APi to get all reviews of deals stats',
  })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  publicReviewStats(@Param('userId') userId: string) {
    return this.dealReviewService.reviewStats(userId)
  }
}
