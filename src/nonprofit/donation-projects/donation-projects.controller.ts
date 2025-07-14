import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  Put,
  Get,
  Query,
  Delete,
  Param,
  Patch,
} from '@nestjs/common'
import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { ICsvDonations } from '@app/src/shared/interfaces'
import { FilterDeleted } from '@app/src/shared/decorators'
import { ValidationPipe } from '@app/src/shared/validations'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { PaginateRO, ReorderDto, SuccessRO } from '@app/src/shared/dto'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'
import { DonationProjectsService } from './donation-projects.service'
import { DonationProjectEntity } from './entities/donation-project.entity'
import {
  QueryDto,
  UpdateVaultDto,
  DonorListQueryDto,
  DonationProjectDto,
  UpdateDonationProjectDto,
  DonationSourceListQueryDto,
  DonationSourceDonorListDto,
} from './dto'

@ApiTags('Nonprofit Donation Projects')
@Controller('nonprofit/donation-projects')
export class DonationProjectsController {
  constructor(private readonly donationProjectsService: DonationProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Donation Projects' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.donationProjectsService.toggleCustomPagination().show(query, userId)
  }

  @Get('export')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Export donation projects' })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationProject(
    @Query(new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<ICsvDonations[]> {
    return this.donationProjectsService.toggleCustomPagination().show(query, userId, true)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Donation Project' })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.showOne(id, query, userId)
  }

  @Get(':id/list/donor')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get donation project's donors list" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donorList(
    @Query(new ValidationPipe()) query: DonorListQueryDto,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donorList(id, userId, query)
  }

  @Get(':id/list/donation-source')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get donation project's donors donation source list" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donationSourceList(
    @Query(new ValidationPipe()) query: DonationSourceListQueryDto,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donationSourceList(id, userId, query)
  }

  @Get(':id/list/donation-source/export')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Export donation project's donors list" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationSource(
    @Query(new ValidationPipe()) query: DonationSourceListQueryDto,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ICsvDonations[]> {
    return this.donationProjectsService.donationSourceList(id, userId, query, true)
  }

  @Get(':id/list/donation-source/:donationSourceId/donor')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get donation project's donors by donation source" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async donationSourceDonor(
    @Param('id') id: string,
    @Param('donationSourceId') donationSourceId: string,
    @User('id') userId: string,
    @Query(new ValidationPipe()) query: DonationSourceDonorListDto,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donationSourceDonor(id, query, userId, donationSourceId)
  }

  @Get(':id/list/donation-source/:donationSourceId')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get donation project's donation source details" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showDonationSource(
    @Param('id') id: string,
    @Param('donationSourceId') donationSourceId: string,
    @User('id') userId: string,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.showDonationSource(id, userId, donationSourceId)
  }

  @Get('export/:id/list/donation-source/:donationSourceId/donor')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Export donation project's donors list" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportDonationSourceDonor(
    @Param('id') id: string,
    @Param('donationSourceId') donationSourceId: string,
    @User('id') userId: string,
    @Query(new ValidationPipe()) query: DonationSourceDonorListDto,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.donationSourceDonor(
      id,
      query,
      userId,
      donationSourceId,
      true,
    )
  }

  @Get(':id/list/donor/export')
  @ApiBearerAuth()
  @UserType(UserTypes.NONPROFIT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Export donation project's donors list" })
  @ApiOkResponse({ type: DonationProjectEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async export(
    @Query(new ValidationPipe()) query: DonorListQueryDto,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<ICsvDonations[]> {
    return this.donationProjectsService.donorList(id, userId, query, true)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create Donation Project' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit does not exist'))
  create(@Body() createDonationProjectDto: DonationProjectDto, @User('id') userId: string) {
    return this.donationProjectsService.create(createDonationProjectDto, userId)
  }

  @UseGuards(SubgraphGuard)
  @UsePipes(new ValidationPipe())
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @Post('vault')
  @ApiOperation({
    summary: 'Update vault address for Donation Project',
    description:
      'To be used by Subgraph Listener to update the vault address of a Donation Project',
  })
  @ApiOkResponse({ type: SuccessRO })
  updateVault(@Body() payload: UpdateVaultDto) {
    return this.donationProjectsService.updateVault(payload)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update Donation Project' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Donation project does not exist'))
  update(
    @Body() updateDonationProjectDto: UpdateDonationProjectDto,
    @User('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.donationProjectsService.update(id, updateDonationProjectDto, userId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Delete donation project' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Donation project does not exist'))
  delete(@Param('id') id: string, @User('id') userId: string): Promise<DonationProjectEntity> {
    return this.donationProjectsService.delete(id, userId)
  }

  @Patch('update-status/:id/draft')
  @ApiOperation({ summary: 'Update donation project status as draft' })
  @ApiOkResponse({ type: DonationProjectEntity })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Donation project does not exist'))
  async updateStatus(
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<DonationProjectEntity> {
    return this.donationProjectsService.updateUnpublished(id, userId)
  }

  @Patch('shuffle-order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update donation project ordering' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Donation project does not exist'))
  reOrder(@Body() payload: ReorderDto) {
    return this.donationProjectsService.reOrder(payload)
  }
}
