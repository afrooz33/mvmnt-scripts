import {
  Body,
  Post,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { DestinationPreferenceService } from './destination-preference.service'
import { CreateDestinationPreferenceDto } from './dto'

@ApiTags('Delivery Settings - Destination Preference')
@Controller('destination-preference')
export class DestinationPreferenceController {
  constructor(private readonly destinationPreferenceService: DestinationPreferenceService) {}

  @Post()
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Create/update destination preference delivery settings' })
  @ApiNotFoundResponse(GetResponse('User/address does not exist'))
  create(
    @Body(new ValidationPipe()) payload: CreateDestinationPreferenceDto,
    @User('id') user: string,
  ) {
    return this.destinationPreferenceService.create(payload, user)
  }

  @Delete(':id')
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Delete destination preference delivery settings' })
  @ApiNotFoundResponse(GetResponse('Setting does not exist'))
  delete(@Param('id') id: string, @User('id') user: string) {
    return this.destinationPreferenceService.delete(id, user)
  }
}
