import { Controller, Get, UseGuards, ValidationPipe, Query, Param } from '@nestjs/common'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { ICsvUserDonations } from '@app/src/shared/interfaces'
import { ReceiptService } from './receipt.service'
import { QueryDto, HistoryQueryDto, DonationQueryDto, RecurringQueryDto } from './dto'

@ApiTags('Nonprofit Receipts')
@Controller('nonprofit/receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get()
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Receipts - Donated users list' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.receiptService.show(query, userId)
  }

  @Get('user/:id/profile')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Receipts - User's profile screen" })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async userProfile(@Param('id') donorId: string, @User('id') userId: string): Promise<PaginateRO> {
    return this.receiptService.userProfile(donorId, userId)
  }

  @Get('export')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Export Receipts - Donated users list' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async export(
    @Query(new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<any> {
    return this.receiptService.show(query, userId, true)
  }

  @Get('user/:id/donations')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Receipts - List of donations from user' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async userDonations(
    @Query(new ValidationPipe()) query: DonationQueryDto,
    @User('id') userId: string,
    @Param('id') donorId: string,
  ): Promise<PaginateRO> {
    return this.receiptService.userDonations(query, userId, donorId)
  }

  @Get('user/:id/export/donations')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Receipts - Export donations from user' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportUserDonations(
    @Query(new ValidationPipe()) query: DonationQueryDto,
    @User('id') userId: string,
    @Param('id') donorId: string,
  ): Promise<ICsvUserDonations> {
    return this.receiptService.userDonations(query, userId, donorId, true)
  }

  @Get('recurring/donations')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Receipts - Recurring donation list' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async recurringDonation(
    @Query(new ValidationPipe()) query: RecurringQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.receiptService.recurringDonation(query, userId)
  }

  @Get('export/recurring/donations')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Receipts - Export recurring donation' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportRecurringDonation(
    @Query(new ValidationPipe()) query: RecurringQueryDto,
    @User('id') userId: string,
  ): Promise<any> {
    return this.receiptService.recurringDonation(query, userId, true)
  }

  @Get('donation/history')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Receipts - Donation history' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showHistory(
    @Query(new ValidationPipe()) query: HistoryQueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.receiptService.userDonations(query, userId, null)
  }

  @Get('export/donation/history')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Receipts - Export donation history' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportHistory(
    @Query(new ValidationPipe()) query: HistoryQueryDto,
    @User('id') userId: string,
  ): Promise<any> {
    return this.receiptService.userDonations(query, userId, null, true)
  }
}
