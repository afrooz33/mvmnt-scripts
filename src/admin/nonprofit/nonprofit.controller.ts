import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
  GetResponse,
} from '@app/src/shared/swagger/responses'
import { Role } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { Roles } from '@app/src/shared/auth/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { NonprofitProfileEntity } from '@app/src/nonprofit/profile/entities/nonprofit-profile.entity'
import { NonprofitService } from './nonprofit.service'
import { NonprofitProfileReviewDto, QueryDto, ExportQueryDto, ActionParamDto } from './dto'

@ApiTags('Admin Nonprofit')
@Controller('admin/nonprofit')
export class NonprofitController {
  constructor(private readonly nonprofitService: NonprofitService) {}

  @Get()
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Get/Filter nonprofit profile' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(null, new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.nonprofitService.show(query)
  }

  @Get('export')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin Export nonprofit' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async export(@Query() query: ExportQueryDto): Promise<any> {
    return this.nonprofitService.show(query, true)
  }

  @Get(':profileId')
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get single nonprofit profile' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(@Param('profileId') id: string): Promise<NonprofitProfileEntity> {
    return this.nonprofitService.showOne(id)
  }

  @Get('export/:profileId')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin Export nonprofit data' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit profile does not exist'))
  async exportNonprofit(@Param('profileId') profileId: string): Promise<any> {
    return this.nonprofitService.showOne(profileId, true)
  }

  @Put(':profileId/review')
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Approve/reject nonprofit profile' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit profile does not exist'))
  async profileReview(
    @Body() payload: NonprofitProfileReviewDto,
    @Param('profileId') id: string,
  ): Promise<SuccessRO> {
    return this.nonprofitService.profileReview(id, payload)
  }

  @Patch(':id/status/:status')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Approve/reject nonprofit profile' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit profile does not exist'))
  async changeAccountStatus(@Param() payload: ActionParamDto): Promise<SuccessRO> {
    return this.nonprofitService.changeAccountStatus(payload)
  }

  @Get(':userId/donation-source')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Admin List of sources donating for nonprofit' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Nonprofit profile does not exist'))
  async donationSource(
    @Param('userId') userId: string,
    @Query() query: MyPaginateDto,
  ): Promise<SuccessRO> {
    return this.nonprofitService.donationSource(userId, query)
  }
}
