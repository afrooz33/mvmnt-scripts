import {
  Body,
  Controller,
  Patch,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
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
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { UserTypes } from '@app/src/shared/enums'
import { EmailChangeService } from './email-change.service'
import { ChangeEmailDto, CreateEmailChangeDto, ResendChangeEmailDto } from './dto'

@ApiTags('Users email changes')
@Controller('user/email-changes')
export class EmailChangeController {
  constructor(private readonly emailChangeService: EmailChangeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User make change email address request' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  create(@Body() payload: CreateEmailChangeDto, @User('id') user: string) {
    return this.emailChangeService.create(payload, user)
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User change email address' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  change(@Body() payload: ChangeEmailDto, @User('id') user: string) {
    return this.emailChangeService.change(payload, user)
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User change email address resend otp' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  resend(@User('id') user: string, @Body() payload: ResendChangeEmailDto) {
    return this.emailChangeService.resend(payload, user)
  }
}
