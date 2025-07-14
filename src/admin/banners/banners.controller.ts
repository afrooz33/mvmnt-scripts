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
} from '@nestjs/common'
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
import { CreateBannerDto, UpdateBannerDto, QueryDto } from '@app/src/admin/banners/dto'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { BannersService } from './banners.service'
import { Roles } from '@app/src/shared/auth/decorators'
import { ValidationPipe } from '@app/src/shared/validations'
import { MyAdminController } from '@app/src/shared/base/my.admin.controller'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { PaginateRO, SuccessRO, UpdateStatusDto } from '@app/src/shared/dto'
import { FilterDeleted } from '@app/src/shared/decorators'
import { BannerEntity } from './entities/banner.entity'
import { BannerStatus } from './enums'

@ApiTags('Admin Banners')
@Controller('admin/banners')
export class BannersController extends MyAdminController<BannerEntity> {
  constructor(private readonly bannersService: BannersService) {
    super(bannersService)
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get banners' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.bannersService.show(query)
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get banner' })
  @ApiOkResponse({ type: BannerEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Param('id') id: string,
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<BannerEntity> {
    return this.bannersService.showOne(id, query)
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin create banner' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Banner does not exist'))
  async create(@Body() payload: CreateBannerDto): Promise<SuccessRO> {
    if (payload.status === BannerStatus.ENABLED) {
      await this.bannersService.autoDisableBanners(payload.section)
    }

    return this.bannersService.create(payload)
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update banner' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Banner does not exist'))
  async update(@Param('id') id: string, @Body() payload: UpdateBannerDto): Promise<BannerEntity> {
    if (payload.status === BannerStatus.ENABLED) {
      await this.bannersService.autoDisableBanners(payload.section)
    }

    return this.bannersService.updateOne({
      ...payload,
      id,
    })
  }

  @Patch('change-status/:id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update banners' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateStatusDto,
  ): Promise<SuccessRO> {
    return this.bannersService.updateStatus({
      status: payload.status,
      ids: [id],
    })
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin delete banners' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async delete(@Param('id') id: string): Promise<SuccessRO> {
    return this.bannersService.delete(id)
  }
}
