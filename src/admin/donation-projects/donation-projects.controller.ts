import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import {
  Get,
  Put,
  Body,
  Param,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
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
import { Role } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { Roles } from '@app/src/shared/auth/decorators'
import { FilterDeleted } from '@app/src/shared/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { ICsvDonationProject } from '@app/src/shared/interfaces'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { DonationProjectsService } from './donation-projects.service'
import {
  QueryDto,
  DonationSourceQueryDto,
  DonationProjectReviewDto,
  DonationSourceDonorQueryDto,
} from './dto'

@ApiTags('Admin Donation Projects')
@Controller('admin/donation-projects')
export class DonationProjectsController {
  constructor(private readonly donationProjectsService: DonationProjectsService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Get Donation Projects' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(null, new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.donationProjectsService.toggleCustomPagination().show(query)
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin Get Donation Project' })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Param('id') id: string,
    @Query(null, new ValidationPipe(), new FilterDeleted('status'))
    query: QueryDto,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.showOne(id, query)
  }

  @Get('export/csv')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export donation project' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async export(@Query(null, new ValidationPipe()) query: QueryDto): Promise<ICsvDonationProject[]> {
    return this.donationProjectsService.show(query, true)
  }

  @Put(':id/review')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Approve/reject donation project' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Donation project does not exist'))
  async review(
    @Body() payload: DonationProjectReviewDto,
    @Param('id') id: string,
  ): Promise<SuccessRO> {
    return this.donationProjectsService.review(payload, id)
  }

  @Get('nonprofit/:userId')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get donation projects for nonprofit' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async list(@Param('userId') userId: string, @Query() query: MyPaginateDto): Promise<PaginateRO> {
    return this.donationProjectsService.list(userId, query)
  }

  @Get(':id/donation-source')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: "Admin Get donation project's donation source" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donationSource(
    @Param('id') id: string,
    @Query(null, new ValidationPipe())
    query: DonationSourceQueryDto,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donationSource(id, query)
  }

  @Get('export/:id/donation-source')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: "Admin export donation project's donation source" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationSource(
    @Param('id') id: string,
    @Query(null, new ValidationPipe(), new FilterDeleted('status'))
    query: DonationSourceQueryDto,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donationSource(id, query, true)
  }

  @Get(':id/donation-source/donors')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'List of donors associated with the donation source',
  })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donationSourceDonor(
    @Param('id') id: string,
    @Query(null, new ValidationPipe()) query: DonationSourceDonorQueryDto,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donationSourceDonor(id, query)
  }

  @Get('export/:id/donation-source/donors')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: "Export donation project's donors list" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationSourceDonor(
    @Param('id') id: string,
    @Query(new ValidationPipe()) query: DonationSourceDonorQueryDto,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donationSourceDonor(id, query, true)
  }
}
