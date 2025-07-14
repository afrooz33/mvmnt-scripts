import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Get, Controller, Query, UseGuards, Param, ParseUUIDPipe } from '@nestjs/common'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { RankingsService } from './rankings.service'
import { StarRankingQueryDto, StarEarningHistoryDto, StarPercentileHistoryQueryDto } from './dto'
import { UserStarPercentileRankingResponse } from './interfaces'

@ApiTags('Users Rankings')
@Controller('users/rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get('star/earning/history')
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
  @ApiOperation({ summary: 'Get list of star earning history by type' })
  starEarningHistory(@Query() query: StarEarningHistoryDto, @User('id') user: string) {
    return this.rankingsService.starEarningHistory(query, user)
  }

  @Get('star')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get all user star ranking' })
  starRanking(@Query() query: StarRankingQueryDto, @User('id') user: string) {
    return this.rankingsService.starRanking(query, user)
  }

  @Get('profile/:userId/stats')
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get user profile stats' })
  profileStats(@Param('userId') userId: string) {
    return this.rankingsService.profileStats(userId)
  }

  @Get('star/percentile-history/:userId')
  @ApiOperation({
    summary:
      "Get user's historical star ranking percentiles and full history for a given star type",
  })
  @ApiBadRequestResponse({ description: 'Invalid input parameters.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  async getUserStarPercentileHistory(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query() query: StarPercentileHistoryQueryDto,
  ): Promise<UserStarPercentileRankingResponse> {
    return this.rankingsService.userStarPercentileRanking(userId, query.star_type)
  }
}
