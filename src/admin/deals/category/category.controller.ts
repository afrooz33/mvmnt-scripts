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
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { UserType } from '@app/src/shared/auth/decorators'
import { UserTypes } from '@app/src/shared/enums'
import { PaginateRO, SuccessRO, UpdateStatusDto } from '@app/src/shared/dto'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { CreateCategoryDto, QueryDto, UpdateCategoryDto } from './dto'
import { DealCategoryService } from './category.service'
import { FilterDeleted } from '@app/src/shared/decorators'
import { MyAdminController } from '@app/src/shared/base/my.admin.controller'
import { DealCategoryEntity } from './entities/deal-category.entity'

@ApiTags('Admin Deal Category')
@Controller('admin/deal/categories')
export class DealCategoryController extends MyAdminController<DealCategoryEntity> {
  constructor(private readonly dealCategoryService: DealCategoryService) {
    super(dealCategoryService)
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UserType(UserTypes.ADMIN)
  @ApiOperation({ summary: 'Admin get all deal categories' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.dealCategoryService.show(query)
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UserType(UserTypes.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin get deal category' })
  @ApiOkResponse({ type: DealCategoryEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Param('id') id: string,
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<DealCategoryEntity> {
    return this.dealCategoryService.showOne(id, query)
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UserType(UserTypes.ADMIN)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin create deal page category' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal category does not exist'))
  create(@Body() payload: CreateCategoryDto) {
    return this.dealCategoryService.create(payload)
  }

  @Put(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UserType(UserTypes.ADMIN)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update deal category' })
  @ApiOkResponse({ type: DealCategoryEntity })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Admin deal category does not exist'))
  update(@Param('id') id: string, @Body() payload: UpdateCategoryDto): Promise<DealCategoryEntity> {
    return this.dealCategoryService.updateOne({
      ...payload,
      id,
    })
  }

  @Patch()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UserType(UserTypes.ADMIN)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin update multiple deal categories' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async updateStatus(@Body() payload: UpdateStatusDto): Promise<SuccessRO> {
    return this.dealCategoryService.updateStatus(payload)
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UserType(UserTypes.ADMIN)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin delete multiple deal categories' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async delete(@Param('id') id: string): Promise<SuccessRO> {
    return this.dealCategoryService.delete(id)
  }
}
