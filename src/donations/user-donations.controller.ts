import { Body, Controller, Post, Put, UseGuards, UsePipes } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import {
  InitiateDirectDonationDto,
  RevertDirectDonationDto,
  ConfirmDonationDto,
  UpdateDonationHashDto,
} from '@app/src/donations/dto'
import { ValidationPipe } from '@app/src/shared/validations'
import { SuccessRO } from '@app/src/shared/dto'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'

@ApiTags('User Donations')
@Controller('user/donation')
export class UserDonationsController {
  constructor(private readonly userDonationsService: UserDonationsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate a Payment for Donation' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async initiateDonation(@User('id') userId: string, @Body() payload: InitiateDirectDonationDto) {
    return await this.userDonationsService.initiateDirectDonation(userId, payload)
  }

  @Post('revert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revert a Payment for Donation' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async revertDonation(@User('id') userId: string, @Body() payload: RevertDirectDonationDto) {
    return await this.userDonationsService.revertDonation(userId, payload.donation)
  }

  @Post('confirm')
  @UseGuards(SubgraphGuard)
  @ApiOperation({ summary: 'Confirm a Payment for Donation' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async confirmDonation(@Body() payload: ConfirmDonationDto) {
    return await this.userDonationsService.confirmDonation(payload)
  }

  @Put('hash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'Update the Transaction Hash for a donation' })
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Payment Item does not exist'))
  updateTransactionHash(
    @Body() payload: UpdateDonationHashDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.userDonationsService.updateTransactionHash(payload, userId)
  }
}
