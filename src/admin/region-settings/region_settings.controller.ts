import {
  Get,
  Put,
  Body,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  ParseArrayPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger'
import { Role } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { Roles } from '@app/src/shared/auth/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { RegionSettingsService } from './region_settings.service'
import { UpsertSettingDto } from './dto'

@ApiTags('Admin region settings')
@Controller('admin/region-settings')
export class RegionSettingsController {
  constructor(private readonly regionSettingsService: RegionSettingsService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin get all region setting' })
  async show(@Query(new ValidationPipe()) query: MyPaginateDto): Promise<PaginateRO> {
    return this.regionSettingsService.show(query)
  }

  @Put()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiBody({ type: [UpsertSettingDto] })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin update region settings' })
  @ApiNotFoundResponse(GetResponse('Setting does not exist'))
  create(
    @Body(
      new ValidationPipe(),
      new ParseArrayPipe({
        items: UpsertSettingDto,
      }),
    )
    payload: [UpsertSettingDto],
  ) {
    return this.regionSettingsService.upsert(payload)
  }
}
