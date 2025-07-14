import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger'
import {
  Get,
  Put,
  Body,
  Query,
  Param,
  Patch,
  UsePipes,
  UseGuards,
  Controller,
} from '@nestjs/common'
import { Role } from '@app/src/shared/enums'
import { Roles } from '@app/src/shared/auth/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { ValidationPipe } from '@app/src/shared/validations'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { UsersService } from './users.service'
import {
  QueryDto,
  ReviewDto,
  BlockedDto,
  AdminMemoDto,
  ProfileReviewDto,
  ChangeUserTypeDto,
  ChangeUserEmailDto,
  IdentityRequestsQueryDto,
} from './dto'

@ApiTags('Admin Users')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get users' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(null, new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.usersService.show(query)
  }

  @Get(':id/details')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get user details' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(@Param('id') id: string): Promise<any> {
    return this.usersService.showOne(id)
  }

  @Get('export')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin export users' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async export(@Query(null, new ValidationPipe()) query: QueryDto): Promise<any> {
    return this.usersService.show(query, true)
  }

  @Patch('block')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin Block user' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  blockUser(@Body() payload: BlockedDto) {
    return this.usersService.block(payload)
  }

  @Patch('unblock/:userId')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin Unblock user' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  unblockUser(@Param('userId') userId: string) {
    return this.usersService.unblock(userId)
  }

  @Patch('mark/:userId/:action')
  @ApiBearerAuth()
  @Roles(Role.OWNER)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin mark user as verified' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiParam({ name: 'action', enum: ['verified', 'unverified'] })
  async changeAccountStatus(
    @Param('userId') id: string,
    @Param('action') action: string,
  ): Promise<SuccessRO> {
    return this.usersService.markVerified(id, action)
  }

  @Put(':id/review')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Approve/reject user' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async review(@Body() payload: ReviewDto, @Param('id') id: string): Promise<SuccessRO> {
    return this.usersService.review(payload, id)
  }

  @Put(':id/admin-memo')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiOperation({ summary: 'Add admin memo to user' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async adminMemo(@Param('id') id: string, @Body() payload: AdminMemoDto): Promise<SuccessRO> {
    return this.usersService.adminMemo(id, payload)
  }

  @Patch('change/:id/usertype')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin change user type' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  changeUsertype(@Body() payload: ChangeUserTypeDto, @Param('id') id: string) {
    return this.usersService.changeUsertype(payload, id)
  }

  @Patch('change-email/:id')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin change user email address' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  changeEmail(@Body() payload: ChangeUserEmailDto, @Param('id') id: string) {
    return this.usersService.changeEmail(payload, id)
  }

  @Patch('profile/:userId/review')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin review user identity document' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Profile does not exist'))
  profileReview(@Body() payload: ProfileReviewDto, @Param('userId') userId: string) {
    return this.usersService.profileReview(payload, userId)
  }

  @Get('list/identity-reviews/requests')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin list of users who requested for reviewing identity verification',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async identityRequests(
    @Query(null, new ValidationPipe()) query: IdentityRequestsQueryDto,
  ): Promise<PaginateRO> {
    return this.usersService.identityRequests(query)
  }

  @Get('profile/:userId/identity/details')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({
    summary: 'Admin get user identity verification details',
  })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async identityDetail(@Param('userId') userId: string) {
    return this.usersService.identityDetail(userId)
  }
}
