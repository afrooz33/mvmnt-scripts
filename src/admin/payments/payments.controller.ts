import { Controller, Get, Param, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger'
import { Role } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { Roles } from '@app/src/shared/auth/decorators'
import { ICsvAdminPayment } from '@app/src/shared/interfaces'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { PaymentsService } from './payments.service'
import { QueryDto, TopStatQueryDto, DonorListQueryDto } from './dto'

@ApiTags('Admin payments')
@Controller('admin/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Aggregation list of monthly donations sent to nonprofits',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.paymentsService.show(query)
  }

  @Get('export')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export aggregation list of monthly donations sent to nonprofits',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async export(@Query(new ValidationPipe()) query: QueryDto): Promise<ICsvAdminPayment[]> {
    return this.paymentsService.show(query, true)
  }

  @Get('admin-margin/top-stats')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin margin top stats',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async topStat(@Query(new ValidationPipe()) query: TopStatQueryDto): Promise<PaginateRO> {
    return this.paymentsService.topStat(query)
  }

  @Get('admin-margin/graph')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin margin graphical data',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donationGraph(@Query(new ValidationPipe()) query: TopStatQueryDto): Promise<PaginateRO> {
    return this.paymentsService.donationGraph(query)
  }

  @Get('export/admin-margin/graph')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export admin margin graphical data',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationGraph(
    @Query(new ValidationPipe()) query: TopStatQueryDto,
  ): Promise<PaginateRO> {
    return this.paymentsService.donationGraph(query, true)
  }

  @Get('admin-margin/list/donations')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin margin - List of donations made',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donationList(@Query(new ValidationPipe()) query: TopStatQueryDto): Promise<PaginateRO> {
    return this.paymentsService.donationList(query)
  }

  @Get('export/admin-margin/list/donations')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin margin - Export donations made',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationList(
    @Query(new ValidationPipe()) query: TopStatQueryDto,
  ): Promise<PaginateRO> {
    return this.paymentsService.donationList(query, true)
  }

  @Get(':month/:year')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List of nonprofits for a specific month',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showBy(
    @Query(new ValidationPipe()) query: QueryDto,
    @Param('month') month: number,
    @Param('year') year: number,
  ): Promise<PaginateRO> {
    return this.paymentsService.showBy(query, month, year)
  }

  @Put('change-status/:month/:year/:status')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change payment status to paid or pending for a specific month',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async markPaid(
    @Param('month') month: string,
    @Param('year') year: string,
    @Param('status') status: string,
  ): Promise<PaginateRO> {
    return this.paymentsService.markPaid(month, year, status)
  }

  @Get('list/:id/donors')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List donation history for the selected nonprofit',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donorList(
    @Query(new ValidationPipe()) query: DonorListQueryDto,
    @Param('id') id: string,
  ): Promise<PaginateRO> {
    return this.paymentsService.donorList(id, query)
  }

  @Get('export/list/:id/donors')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Export donation history for the selected nonprofit',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donorExportList(
    @Query(new ValidationPipe()) query: DonorListQueryDto,
    @Param('id') id: string,
  ): Promise<PaginateRO> {
    return this.paymentsService.donorList(id, query, true)
  }
}
