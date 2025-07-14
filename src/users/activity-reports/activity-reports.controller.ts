import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import {
  ApiTags,
  ApiConsumes,
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
import { FileInterceptor } from '@nestjs/platform-express'
import { UserTypes } from '@app/src/shared/enums'
import { FilterDeleted } from '@app/src/shared/decorators'
import { UserType, User, SkipAuth } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { FollowerDto } from '@app/src/users/follower/dto'
import { ActivityReportsService } from './activity-reports.service'
import {
  QueryDto,
  QueryPublicDto,
  CreateAssetDto,
  QueryFollowDto,
  QueryCommentDto,
  CreateCommentDto,
  CreateActivityReportsDto,
  UpdateActivityReportsDto,
} from './dto'
import { AssetsService } from './assets.service'

@ApiTags('Nonprofit user activity reports')
@Controller('nonprofit-user/activity-reports')
export class ActivityReportsController {
  constructor(
    private activityReportsService: ActivityReportsService,
    private assetsService: AssetsService,
  ) {}

  @Post('assets/upload')
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Upload activity report assets' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() { is_featured }: CreateAssetDto,
  ): Promise<any> {
    return await this.assetsService.processAndUpload(file, is_featured)
  }

  @Post('follow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({
    summary: 'User follow/unfollow nonprofit user, if already followed then unfollow it',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  follow(@Body() payload: FollowerDto, @User('id') user: string) {
    return this.activityReportsService.follow(payload, user)
  }

  @Get('followers')
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get nonprofit user followers' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showFollower(@User('id') user: string, @Query() query: QueryFollowDto) {
    return this.activityReportsService.showFollower(query, user)
  }

  @Get('following')
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get nonprofit user following' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showFollowing(@User('id') user: string, @Query() query: QueryFollowDto) {
    return this.activityReportsService.showFollowing(query, user)
  }

  @Get('public')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get public user activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showPublic(@Query() query: QueryPublicDto, @User('id') user: string) {
    return this.activityReportsService.showPublic(query, user)
  }

  @Get(':id')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get nonprofit user single activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showOne(@Param('id') id: string, @User('id') user: string) {
    return this.activityReportsService.showOne(id, user)
  }

  @Get()
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get nonprofit user activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  get(@User('id') user: string, @Query(new FilterDeleted()) query: QueryDto) {
    return this.activityReportsService.show(query, user)
  }

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
  @ApiOperation({ summary: 'Create nonprofit user activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  create(@Body(new ValidationPipe()) payload: CreateActivityReportsDto, @User('id') user: string) {
    return this.activityReportsService.create(payload, user)
  }

  @Post('bookmark/:id')
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
  @ApiOperation({ summary: 'Activity report bookmark' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  addBookmark(@Param('id') id: string, @User('id') user: string) {
    return this.activityReportsService.addBookmark(id, user)
  }

  @Delete('bookmark/:id')
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
  @ApiOperation({ summary: 'Activity report remove bookmark' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  removeBookmark(@Param('id') id: string, @User('id') user: string) {
    return this.activityReportsService.removeBookmark(id, user)
  }

  @Put()
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
  @ApiOperation({ summary: 'Update nonprofit user activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  update(@Body(new ValidationPipe()) payload: UpdateActivityReportsDto, @User('id') user: string) {
    return this.activityReportsService.update(payload, user)
  }

  @Delete(':id')
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Delete nonprofit user activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  delete(@Param('id') id: string, @User('id') user: string) {
    return this.activityReportsService.delete(id, user)
  }

  @Get('comments/:id')
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Show comment on nonprofit user activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showComment(@Query() query: QueryCommentDto, @Param('id') activity_report: string) {
    return this.activityReportsService.showComment(query, activity_report)
  }

  @Post('comments')
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
  @ApiOperation({ summary: 'Post comment on nonprofit user activity report' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  createComment(@Body() payload: CreateCommentDto, @User('id') user: string) {
    return this.activityReportsService.createComment(payload, user)
  }
}
