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
import { Body, Controller, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { SuccessRO } from '@app/src/shared/dto'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { UserTypes } from '@app/src/shared/enums'
import { ProfileService } from '@app/src/re2/profile/profile.service'
import { UpdateProfileDto } from '@app/src/re2/profile/dto'

@ApiTags('RE2 Profile')
@Controller('re2/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.RE2)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update Profile' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  update(@Body() payload: UpdateProfileDto, @User('id') userId: string) {
    return this.profileService.update(payload, userId)
  }
}
