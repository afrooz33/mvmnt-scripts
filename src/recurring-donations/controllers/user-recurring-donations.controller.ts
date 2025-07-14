import { Body, Controller, Get, Post, Put, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { RecurringDonationsService } from '@app/src/recurring-donations/recurring-donations.service'
import {
  RegisterRecurringDonationDealDto,
  RegisterRecurringDonationDirectDto,
  CancelSingleRecurringDonationDto,
  ConfirmCancelRecurringDonationDto,
} from '@app/src/recurring-donations/dto'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'
import { ValidationPipe } from '@app/src/shared/validations'
import { SuccessRO } from '@app/src/shared/dto'

@ApiTags('Recurring Donations')
@Controller('user/donation/recurring')
export class UserRecurringDonationsController {
  constructor(private readonly recurringDonationsService: RecurringDonationsService) {}

  @Post('deal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Recurring Donation for a Deal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async registerRecurringDeal(
    @User('id') userId: string,
    @Body() payload: RegisterRecurringDonationDealDto,
  ) {
    return await this.recurringDonationsService.registerDeal(userId, payload)
  }

  @Post('direct')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Recurring Donation for a Direct Donation' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async registerRecurringDirect(
    @User('id') userId: string,
    @Body() payload: RegisterRecurringDonationDirectDto,
  ) {
    return await this.recurringDonationsService.registerDirect(userId, payload)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all Recurring Donations of a User' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async getDonations(@User('id') userId: string) {
    return await this.recurringDonationsService.getAllDonations(userId)
  }

  @Put('cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a Recurring Donation' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async cancelRecurring(
    @User('id') userId: string,
    @Body() payload: CancelSingleRecurringDonationDto,
  ) {
    return await this.recurringDonationsService.cancelSingleRecurring(userId, payload)
  }

  @UseGuards(SubgraphGuard)
  @UsePipes(new ValidationPipe())
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @Post('cancel/single')
  @ApiOperation({
    summary: 'Confirm cancellation of a single recurring donation',
    description:
      'To be used by Subgraph Listener to Confirm cancellation of a single recurring donation',
  })
  @ApiOkResponse({ type: SuccessRO })
  confirmCancel(@Body() payload: ConfirmCancelRecurringDonationDto) {
    return this.recurringDonationsService.confirmCancelRecurring(payload)
  }
}
