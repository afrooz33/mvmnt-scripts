import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiConflictResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { FilterDeleted } from '@app/src/shared/decorators'
import { PaginateRO, SuccessRO, UpdateStatusDto } from '@app/src/shared/dto'
import { MyAdminController } from '@app/src/shared/base/my.admin.controller'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { HomepagesService } from './homepages.service'
import { HomepagesEntity } from './entities/homepages.entity'
import {
  QueryDto,
  EditContentDto,
  CreateHomepageDto,
  ManualUserFilterDto,
  ManualDealFilterDto,
} from './dto'

@ApiTags('Admin Homepages')
@Controller('admin/homepages')
export class HomepagesController extends MyAdminController<HomepagesEntity> {
  constructor(private readonly homepagesService: HomepagesService) {
    super(homepagesService)
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin list homepages' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  show(@Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto) {
    return this.homepagesService.show(query)
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin list homepage by id' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  showOne(@Param('id') id: string) {
    return this.homepagesService.showOne(id)
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin create single/multiple homepage' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Homepage does not exist'))
  @ApiConflictResponse(GetResponse('Homepage already exists'))
  create(@Body() payload: CreateHomepageDto) {
    return this.homepagesService.create(payload)
  }

  @Patch('change-status/:id')
  @ApiBearerAuth()
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin change homepage status' })
  @ApiOkResponse({ type: HomepagesEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Homepage does not exist'))
  async changeAccountStatus(
    @Param('id') id: string,
    @Body() payload: UpdateStatusDto,
  ): Promise<SuccessRO> {
    return this.homepagesService.updateStatus({
      status: payload.status,
      ids: [id],
    })
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin delete homepages' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async delete(@Param('id') id: string): Promise<SuccessRO> {
    return this.homepagesService.delete(id)
  }

  @Put('edit/:id/content')
  @ApiBearerAuth()
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin edit homepage contents' })
  @ApiOkResponse({ type: HomepagesEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Homepage does not exist'))
  async editContent(@Param('id') id: string, @Body() payload: EditContentDto): Promise<SuccessRO> {
    return this.homepagesService.editContent(id, payload)
  }

  @Get('manual/user/filter')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Manually filter users' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOkResponse({ type: PaginateRO })
  manualUserFilter(@Query(new ValidationPipe()) query: ManualUserFilterDto) {
    return this.homepagesService.manualUserFilter(query)
  }

  @Get('manual/deal/filter')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Manually filter deals' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOkResponse({ type: PaginateRO })
  manualDealFilter(@Query(new ValidationPipe()) query: ManualDealFilterDto) {
    return this.homepagesService.manualDealFilter(query)
  }
}
