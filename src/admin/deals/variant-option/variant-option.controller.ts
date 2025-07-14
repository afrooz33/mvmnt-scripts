import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { Roles } from '@app/src/shared/auth/decorators'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { Role } from '@app/src/shared/enums'
import { VariantOptionService } from './variant-option.service'
import { CreateDealVariantOptionDto } from './dto'

@ApiTags('Admin Variant Options')
@Controller('admin/variant-options')
export class VariantOptionController {
  constructor(private readonly variantOptionService: VariantOptionService) {}

  @Post()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin create deal variant options' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal variant option does not exist'))
  create(@Body() payload: CreateDealVariantOptionDto) {
    return this.variantOptionService.create(payload)
  }
}
