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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { ValidationPipe } from '@app/src/shared/validations'
import {
  BadRequestResponse,
  ConflictResponse,
  ForbiddenResponse,
  GetResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { AdminUserService } from './user.service'
import { Roles } from '@app/src/shared/auth/decorators'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { Role } from '@app/src/shared/enums'
import { AdminUserEntity } from './entities/user.entity'
import { CreateAdminDto, QueryDto, UpdateAdminDto, AdminChangeStatusDto } from './dto'
import { FilterDeleted } from '@app/src/shared/decorators'

@ApiTags('Admin User')
@Controller('admin/user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get staffs' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new ValidationPipe(), new FilterDeleted()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.adminUserService.show(query)
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get staff by id' })
  @ApiOkResponse({ type: AdminUserEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Param('id') id: string,
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<AdminUserEntity> {
    return this.adminUserService.showOne(id, query)
  }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin staff' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async create(@Body() payload: CreateAdminDto): Promise<SuccessRO> {
    return this.adminUserService.create(payload)
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin staff' })
  @ApiCreatedResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConflictResponse(ConflictResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Admin staff does not exist'))
  async update(@Body() payload: UpdateAdminDto, @Param('id') id: string): Promise<AdminUserEntity> {
    return this.adminUserService.updateAdmin(id, payload)
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Delete admin staff' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Admin staff does not exist'))
  delete(@Param('id') id: string): Promise<SuccessRO> {
    return this.adminUserService.deleteOne(id)
  }

  @Patch('change-status/:adminId')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin change staff user status' })
  @ApiOkResponse({ type: AdminUserEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Admin staff does not exist'))
  async changeAccountStatus(
    @Param('adminId') id: string,
    @Body() payload: AdminChangeStatusDto,
  ): Promise<AdminUserEntity> {
    return this.adminUserService.updateOne({
      id,
      status: payload.status,
    })
  }
}
