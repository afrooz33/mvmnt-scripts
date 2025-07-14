import { Response } from 'express'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { SuccessRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { SnsProvider } from '@app/src/users/profile/enums'
import { ProfileService } from './profile.service'
import { BlogSnsDto, ProfileVerificationDto, SnsProviderDto, UpdateUserProfileDto } from './dto'

@ApiTags('User profile')
@Controller('users/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'Get user submitted profile verification' })
  getVerification(@User('id') userId: string) {
    return this.profileService.getVerification(userId)
  }

  @Put('verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User profile verification' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  verification(@Body() payload: ProfileVerificationDto, @User('id') userId: string) {
    return this.profileService.verification(payload, userId)
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
  @ApiOperation({ summary: 'Update Profile - DP133_Me' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  update(@Body() payload: UpdateUserProfileDto, @User('id') userId: string) {
    return this.profileService.update(payload, userId)
  }

  @Get(':id/init/:provider')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Generate SNS profile login url' })
  async getSnsLoginUrl(@Param() params: SnsProviderDto, @Res() response: Response) {
    const snsLoginUrl = await this.profileService.getSnsLoginUrl(params)

    return response.redirect(snsLoginUrl)
  }

  @Get(':provider/callback')
  @ApiParam({
    name: 'provider',
    enum: SnsProvider,
  })
  async snsCallback(@Param('provider') provider: SnsProvider, @Query() payload: any): Promise<any> {
    const SnsProfile: Record<string, any> = await this.profileService.getSnsProfile(
      {
        provider,
      },
      payload,
    )

    return this.profileService.snsConnect(SnsProfile, payload.state, provider)
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Save blog url' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  saveBlogUrl(@Body() payload: BlogSnsDto, @User('id') userId: string) {
    return this.profileService.snsConnect(payload, userId, SnsProvider.BLOG)
  }

  @Delete('remove/profile-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove profile image - DP133_Me' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  removeProfileImage(@User('id') userId: string) {
    return this.profileService.removeProfileImage(userId)
  }

  @Put('remove/sns/:provider')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiParam({ name: 'provider', enum: SnsProvider })
  @ApiOperation({ summary: 'Remove SNS profile - DP133_Me' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  removeSns(@Param() params: SnsProvider, @User('id') userId: string) {
    return this.profileService.removeSns(params, userId)
  }
}
