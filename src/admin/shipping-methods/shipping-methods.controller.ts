import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
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
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
  ConflictResponse,
} from '@app/src/shared/swagger/responses'
import {
  CreateShippingMethodDto,
  UpdateShippingMethodDto,
  QueryDto,
} from '@app/src/admin/shipping-methods/dto'
import { Roles } from '@app/src/shared/auth/decorators'
import { ErrorKey, Role } from '@app/src/shared/enums'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { ShippingMethodsService } from './shipping-methods.service'
import { FilterDeleted } from '@app/src/shared/decorators'
import { MyAdminController } from '@app/src/shared/base/my.admin.controller'
import { ShippingMethodEntity } from '@app/src/admin/shipping-methods/entities/shipping-method.entity'

@ApiTags('Admin Shipping methods')
@Controller('admin/shipping-methods')
export class ShippingMethodsController extends MyAdminController<ShippingMethodEntity> {
  constructor(private readonly shippingMethodsService: ShippingMethodsService) {
    super(shippingMethodsService)
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get shipping method' })
  @ApiOkResponse({ type: ShippingMethodEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Param('id') id: string,
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<ShippingMethodEntity> {
    return this.shippingMethodsService.showOne(id, query)
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get all shipping methods' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.shippingMethodsService.toggleCustomPagination().show(query)
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin create shipping method' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Shipping method does not exist'))
  create(@Body() createShippingMethodDto: CreateShippingMethodDto) {
    return this.shippingMethodsService.create(createShippingMethodDto)
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update shipping method' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiNotFoundResponse(GetResponse('Shipping method does not exist'))
  update(@Param('id') id: string, @Body() updateShippingMethodDto: UpdateShippingMethodDto) {
    return this.shippingMethodsService.updateOne(updateShippingMethodDto, {
      where: { id },
      errorKey: ErrorKey.RESOURCE_NOT_FOUND,
    })
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin delete shipping method' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async delete(@Param('id') id: string): Promise<SuccessRO> {
    return this.shippingMethodsService.delete(id)
  }
}
