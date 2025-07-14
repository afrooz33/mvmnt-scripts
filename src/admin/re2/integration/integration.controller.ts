import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Get, Query, UseGuards, Controller } from '@nestjs/common'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { PaginateRO } from '@app/src/shared/dto'
import { Roles } from '@app/src/shared/auth/decorators'
import { ValidationPipe } from '@app/src/shared/validations'
import { AdminRolesGuard, AdminJwtAuthGuard } from '@app/src/shared/auth/guards'
import { QueryDto } from './dto'
import { IntegrationService } from './integration.service'

@ApiTags('Admin RE2 Integration')
@Controller('admin/re2/integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List of RE2 integrations' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async show(@Query(new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.integrationService.show(query)
  }
}
