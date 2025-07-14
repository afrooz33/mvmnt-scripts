import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { Get, Query, Param, Controller, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { GetResponse, BadRequestResponse } from '@app/src/shared/swagger/responses'
import { DonateTo } from './enums'
import { DonationsService } from './donations.service'

@ApiTags('User donation')
@Controller('user/donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get('public/:id/:donated_to')
  @ApiOperation({
    summary: 'Get donations details on either nonprofit or donation project',
  })
  @ApiParam({ enum: DonateTo, name: 'donated_to' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User or nonprofit not found'))
  show(
    @Param('id') id: string,
    @Param('donated_to') donated_to: DonateTo,
    @Query() query: MyPaginateDto,
  ) {
    return this.donationsService.show(id, donated_to, query)
  }

  @Get(':userId/public/profile/stats')
  @ApiOperation({ summary: 'User donation profile' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  profileStats(@Param('userId') userId: string) {
    return this.donationsService.profileStats(userId)
  }

  @Get(':userId/public/profile/donation-types/stats')
  @ApiOperation({
    summary: 'User donation profile donation type stats',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  donationStats(@Param('userId') userId: string) {
    return this.donationsService.donationStats(userId)
  }

  @Get(':userId/public/profile/genre/pie-chart')
  @ApiOperation({
    summary: 'Pie chart data',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  chartStats(@Param('userId') userId: string) {
    return this.donationsService.chartStats(userId)
  }

  @Get('public/donation/stats/:id/:source')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiParam({ enum: DonateTo, name: 'source' })
  @ApiNotFoundResponse(GetResponse('User not found'))
  @ApiOperation({
    summary: 'Get donation stats for a specific resource either nonprofit or donation project',
  })
  userDonationStats(
    @Param('id') id: string,
    @Param('source') source: DonateTo,
    @User('id') userId: string,
  ) {
    return this.donationsService.userDonationStats(id, source, userId)
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('User not found'))
  @ApiOperation({ summary: 'Get pending donations' })
  pendingDonations(@Query() query: MyPaginateDto, @User('id') userId: string) {
    return this.donationsService.pendingDonations(query, userId)
  }
}
