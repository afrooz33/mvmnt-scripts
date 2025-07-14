import { Get, Query, UsePipes, UseGuards, Controller, ValidationPipe, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
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
import { ReceiptService } from './receipt.service'
import { QueryDto, RecurringDonationsQueryDto } from './dto'

@ApiTags('Re2 Receipts')
@Controller('re2/receipts')
export class ReceiptController {
  constructor(private readonly receiptsService: ReceiptService) {}

  @Get('donated/users')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'RE2 Receipt - Donated users' })
  showDonors(@Query() query: QueryDto, @User('id') userId: string) {
    return this.receiptsService.showDonors(query, userId)
  }

  @Get('donated/:userId/users/contributions')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'RE2 Receipt - Donated user contributions' })
  showDonorContributions(
    @Query() query: QueryDto,
    @User('id') userId: string,
    @Param('userId') donorId: string,
  ) {
    return this.receiptsService.showDonorContributions(donorId, query, userId)
  }

  @Get('source/transactions')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'RE2 Receipt - Source transactions' })
  showSourceTransactions(@Query() query: QueryDto, @User('id') userId: string) {
    return this.receiptsService.showSourceTransactions(query, userId)
  }

  @Get('recurring/donations')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'RE2 Receipt - Recurring donations' })
  showRecurringDonations(@Query() query: RecurringDonationsQueryDto, @User('id') userId: string) {
    return this.receiptsService.showRecurringDonations(query, userId)
  }

  @Get('recurring/donations/month/group')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'RE2 Receipt - Recurring donations by month group' })
  showMonthGroup(@Query() query: QueryDto, @User('id') userId: string) {
    return this.receiptsService.showMonthGroup(query, userId)
  }
}
