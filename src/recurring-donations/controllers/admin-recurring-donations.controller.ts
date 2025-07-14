import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { BadRequestResponse, UnauthorizedResponse } from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { SuccessRO } from '@app/src/shared/dto'
import { RecurringDonationsService } from '@app/src/recurring-donations/recurring-donations.service'
import { CancelRecurringDonationDto } from '@app/src/recurring-donations/dto'

@ApiTags('Recurring Donations')
@Controller('admin/donation/recurring')
export class AdminRecurringDonationsController {
  constructor(private readonly recurringDonationsService: RecurringDonationsService) {}

  @Post('cancel')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Cancel recurring donations for a User' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async cancelRecurring(@Body() payload: CancelRecurringDonationDto): Promise<SuccessRO> {
    return await this.recurringDonationsService.cancelUserRecurring(payload.user)
  }
}
