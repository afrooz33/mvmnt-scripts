import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Get, Query, UseGuards, Controller, Patch, Param } from '@nestjs/common'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { ValidationPipe } from '@app/src/shared/validations'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { FundraiserService } from './fundraiser.service'
import { QueryDto, QueryContributorDto, QueryDonationSourceDto } from './dto'

@ApiTags('Admin RE2')
@Controller('admin/re2')
export class FundraiserController {
  constructor(private readonly fundraiserService: FundraiserService) {}

  @Get('fundraisers')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List of RE2 fundraisers' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async show(@Query(new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.fundraiserService.show(query)
  }

  @Get('donation-sources')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List of donation sources from RE2' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async showDonationSource(
    @Query(new ValidationPipe()) query: QueryDonationSourceDto,
  ): Promise<PaginateRO> {
    return this.fundraiserService.showDonationSource(query)
  }

  @Get('export/donation-sources')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export list of donation sources from RE2' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async exportDonationSource(
    @Query(new ValidationPipe()) query: QueryDonationSourceDto,
  ): Promise<PaginateRO> {
    return this.fundraiserService.showDonationSource(query, true)
  }

  @Patch('suspend/fundraiser/page/:id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin suspend fundraiser page' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async suspendPage(@Param('id') id: string): Promise<SuccessRO> {
    return this.fundraiserService.suspendPage(id)
  }

  @Patch('reactivate/fundraiser/page/:id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reactivate fundraiser page' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async reactivatePage(@Param('id') id: string): Promise<SuccessRO> {
    return this.fundraiserService.reactivatePage(id)
  }

  @Patch('suspend/fundraiser/form/:id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin suspend fundraiser form' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async suspendForm(@Param('id') id: string): Promise<SuccessRO> {
    return this.fundraiserService.suspendForm(id, 'suspended')
  }

  @Patch('reactivate/fundraiser/form/:id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reactivate fundraiser form' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async reactivateForm(@Param('id') id: string): Promise<SuccessRO> {
    return this.fundraiserService.reactivateForm(id, 'reactivated')
  }

  @Get('list/contributors')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin list contributors' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async listContributors(@Query() query: QueryContributorDto): Promise<SuccessRO> {
    return this.fundraiserService.listContributors(query)
  }
}
