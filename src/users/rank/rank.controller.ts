import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { SuccessRO } from '@app/src/shared/dto'
import { ValidationPipe } from '@app/src/shared/validations'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'
import { BadRequestResponse, UnauthorizedResponse } from '@app/src/shared/swagger/responses'
import { UpdateRanksDto, CheckBTResponseDto } from './dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { UserTypes } from '@app/src/shared/enums'
import { RankService } from './rank.service'

@ApiTags('User Rank')
@Controller('user/rank')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Post('update')
  @UseGuards(SubgraphGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Update ranks of Users' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  updateRank(@Body() payload: UpdateRanksDto): Promise<SuccessRO> {
    return this.rankService.updateUserRanks(payload)
  }

  @Post('history')
  @UseGuards(SubgraphGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Update user rank history' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  storeRankHistory(): Promise<SuccessRO> {
    return this.rankService.storePreviousUserRanks()
  }

  @Get('brand-token/eligibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT, UserTypes.INDIVIDUAL_PERSONAL, UserTypes.INDIVIDUAL_INFLUENCER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check eligibility for brand token issuance' })
  @ApiOkResponse({ type: CheckBTResponseDto })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  async checkBrandTokenEligibility(@User('id') userId: string): Promise<CheckBTResponseDto> {
    return this.rankService.checkBTEligibility(userId)
  }
}
