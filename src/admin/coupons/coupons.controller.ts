import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiNotFoundResponse,
} from '@nestjs/swagger'
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
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { FilterDeleted } from '@app/src/shared/decorators'
import { PaginateRO, SuccessRO, UpdateStatusDto } from '@app/src/shared/dto'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { MyAdminController } from '@app/src/shared/base/my.admin.controller'
import { CouponsService } from './coupons.service'
import { CouponsEntity } from './entities/coupons.entity'
import { QueryDto, CreateCouponDto, UpdateCouponDto, ListCategoryQueryDto } from './dto'

@ApiTags('Admin coupons')
@Controller('admin/coupons')
export class CouponsController extends MyAdminController<CouponsEntity> {
  constructor(private readonly couponsService: CouponsService) {
    super(couponsService)
  }

  @Get()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get all coupons' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Coupon not found'))
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.couponsService.toggleCustomPagination().show(query)
  }

  @Get('list/categories')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Get list of deal category for coupon' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Category not found'))
  async listCategory(
    @Query(new FilterDeleted(), new ValidationPipe())
    query: ListCategoryQueryDto,
  ): Promise<PaginateRO> {
    return this.couponsService.listCategory(query)
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get coupon' })
  @ApiOkResponse({ type: CouponsEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Coupon not found'))
  async showOne(
    @Param('id') id: string,
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<CouponsEntity> {
    return this.couponsService.showOne(id, query)
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin create coupon' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Coupon does not exist'))
  create(@Body() payload: CreateCouponDto) {
    return this.couponsService.create(payload)
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update coupon' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Coupon does not exist'))
  update(@Param('id') id: string, @Body() payload: UpdateCouponDto) {
    return this.couponsService.updateCoupon(id, payload)
  }

  @Patch(':id/change-status')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update multiple coupons' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateStatusDto,
  ): Promise<SuccessRO> {
    return this.couponsService.updateStatus({
      ids: [id],
      ...payload,
    })
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin delete multiple coupons' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async delete(@Param('id') id: string): Promise<SuccessRO> {
    return this.couponsService.delete(id)
  }
}
