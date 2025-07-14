import { Body, Controller, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
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
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { Roles, User } from '@app/src/shared/auth/decorators'
import { Role } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { AdminProfileService } from './profile.service'
import { UpdateAdminProfileDto } from './dto'

@ApiTags('Admin Profile')
@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly adminProfileService: AdminProfileService) {}

  @Put()
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update Profile' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  update(@Body() payload: UpdateAdminProfileDto, @User('id') userId: string) {
    return this.adminProfileService.update(payload, userId)
  }
}
