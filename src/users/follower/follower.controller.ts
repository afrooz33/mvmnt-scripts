import {
  Get,
  Body,
  Post,
  Query,
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
import { InjectUserToBody } from '@app/src/shared/decorators'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { FollowerService } from './follower.service'
import { FollowerDto, DeleteFollowerDto } from './dto'

@ApiTags('User followers')
@Controller('user/followers')
export class FollowerController {
  constructor(private readonly followerService: FollowerService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User follow' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @InjectUserToBody('follower')
  create(@Body() payload: FollowerDto) {
    return this.followerService.create(payload)
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Delete followed user' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @InjectUserToBody('follower')
  delete(@Body() payload: DeleteFollowerDto, @User('id') userId: string) {
    return this.followerService.remove(payload, { follower: { id: userId } })
  }

  @Get('followers')
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get user followers' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showFollower(@Query('userId') user: string) {
    return this.followerService.showFollower(user)
  }

  @Get('followings')
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get user followers' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showFollowing(@Query('userId') user: string) {
    return this.followerService.showFollowing(user)
  }
}
