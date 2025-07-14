import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { BrandTokensService } from './brand-tokens.service'
import { AdminNotesDto, BrandTokenRequestQueryDto } from './dto'

@ApiTags('Admin Brand Tokens')
@Controller('admin/brand-tokens')
export class BrandTokensController {
  constructor(private readonly brandTokensService: BrandTokensService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Get all brand token requests' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async show(
    @Query(new ValidationPipe({ transform: true })) query: BrandTokenRequestQueryDto,
  ): Promise<PaginateRO> {
    return this.brandTokensService.show(query)
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Get single brand token request' })
  @ApiOkResponse({ type: SuccessRO })
  async showOne(@Param('id') id: string): Promise<SuccessRO> {
    return this.brandTokensService.showOne(id)
  }

  @Post(':id/approve')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Approve brand token request' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async approve(@Param('id') id: string, @Body() payload: AdminNotesDto): Promise<SuccessRO> {
    return this.brandTokensService.approve(id, payload.admin_notes)
  }

  @Post(':id/reject')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Reject brand token request' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async reject(@Param('id') id: string, @Body() payload: AdminNotesDto): Promise<SuccessRO> {
    return this.brandTokensService.reject(id, payload)
  }
}
