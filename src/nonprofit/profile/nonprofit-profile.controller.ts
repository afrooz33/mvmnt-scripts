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
import { NonprofitProfileService } from '@app/src/nonprofit/profile/nonprofit-profile.service'
import { UpdateNonprofitProfileDto } from '@app/src/nonprofit/profile/dto'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { UserTypes } from '@app/src/shared/enums'

@ApiTags('Nonprofit Profile')
@Controller('nonprofit/profile')
export class NonprofitProfileController {
  constructor(private readonly nonprofitProfileService: NonprofitProfileService) {}

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Update Profile' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  update(@Body() payload: UpdateNonprofitProfileDto, @User('id') userId: string) {
    return this.nonprofitProfileService.update(payload, userId)
  }
}
