import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { CreateBrandDto, QueryDto, UpdateBrandDto } from '@app/src/admin/brands/dto'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiOkResponse,
  ApiConflictResponse,
} from '@nestjs/swagger'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { Role } from '@app/src/shared/enums'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { MyAdminController } from '@app/src/shared/base/my.admin.controller'
import { Roles } from '@app/src/shared/auth/decorators'
import { FilterDeleted } from '@app/src/shared/decorators'
import { BrandsService } from './brands.service'
import { BrandEntity } from './entities/brand.entity'

@ApiTags('Admin Brands')
@Controller('admin/brands')
export class BrandsController extends MyAdminController<BrandEntity> {
  constructor(private readonly brandsService: BrandsService) {
    super(brandsService)
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get all brands' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.brandsService.toggleCustomPagination().show(query)
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get brand' })
  @ApiOkResponse({ type: BrandEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Param('id') id: string,
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<BrandEntity> {
    return this.brandsService.showOne(id, query)
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin create brand' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Brand does not exist'))
  @ApiConflictResponse(GetResponse('Brand already exists'))
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.createUnique(createBrandDto, null, 'name')
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update brand' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Brand does not exist'))
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.updateUnique(id, updateBrandDto, 'name')
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.MANAGER, Role.STAFF, Role.OWNER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin delete multiple brands' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async delete(@Param('id') id: string): Promise<SuccessRO> {
    return this.brandsService.delete(id)
  }
}
