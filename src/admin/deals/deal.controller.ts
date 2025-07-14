import {
  Get,
  Put,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
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
import { Role } from '@app/src/shared/enums'
import { ICsvDeals } from '@app/src/shared/interfaces'
import { FilterDeleted } from '@app/src/shared/decorators'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { Roles, User } from '@app/src/shared/auth/decorators'
import { AdminJwtAuthGuard, AdminRolesGuard } from '@app/src/shared/auth/guards'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import {
  BanDto,
  QueryDto,
  UserDealDto,
  DealReviewDto,
  RaffleWinnerDto,
  PurchaseHistoryDto,
  ChangeRaffleWinnerDto,
} from './dto'
import { DealService } from './deal.service'

@ApiTags('Admin Deals')
@Controller('admin/deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Get()
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get all deals' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.dealService.show(query)
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: "Admin get user's deals" })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async userDeal(
    @Param('userId') userId: string,
    @Query() query: UserDealDto,
  ): Promise<PaginateRO> {
    return this.dealService.userDeal(userId, query)
  }

  @Get(':id/details')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin get deal' })
  @ApiOkResponse({ type: DealEntity })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(@Param('id') id: string): Promise<DealEntity> {
    return this.dealService.showOne(id)
  }

  @Get('export')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin export deals' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async export(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<ICsvDeals[]> {
    return this.dealService.show(query, true)
  }

  @Put(':id/review')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Approve/reject deal' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  async review(@Body() payload: DealReviewDto, @Param('id') id: string): Promise<SuccessRO> {
    return this.dealService.review(payload, id)
  }

  @Get(':id/users/purchase-history')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin list of users purchased on the deal' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async purchaseHistory(
    @Query(new ValidationPipe()) query: PurchaseHistoryDto,
    @Param('id') id: string,
  ): Promise<PaginateRO> {
    return this.dealService.purchaseHistory(id, query)
  }

  @Get('export/:id/users/purchase-history')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Admin export list of users purchased on the deal' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportPurchaseHistory(
    @Query(new ValidationPipe()) query: PurchaseHistoryDto,
    @Param('id') id: string,
  ): Promise<PaginateRO> {
    return this.dealService.purchaseHistory(id, query, true)
  }

  @Get(':id/raffle/winners')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Get raffle winners' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async raffleWinner(
    @Query(new ValidationPipe()) query: RaffleWinnerDto,
    @Param('id') id: string,
  ): Promise<PaginateRO> {
    return this.dealService.raffleWinner(id, query)
  }

  @Get('export/:id/raffle/winners')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @ApiOperation({ summary: 'Export raffle winners' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportRaffleWinner(
    @Query(new ValidationPipe()) query: RaffleWinnerDto,
    @Param('id') id: string,
  ): Promise<PaginateRO> {
    return this.dealService.raffleWinner(id, query, true)
  }

  @Put('change/:id/raffle/winners')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Change raffle winner' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Winner does not exist'))
  async changeRaffleWinner(
    @Param('id') id: string,
    @Body() payload: ChangeRaffleWinnerDto,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.dealService.changeRaffleWinner(id, payload, userId)
  }

  @Patch('decline/:id')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin decline a raffle deal' })
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  async decline(@Body() payload: BanDto, @Param('id') id: string): Promise<SuccessRO> {
    return this.dealService.decline(id, payload)
  }

  @Patch('suspend/:id')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Admin suspend a deal' })
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  async suspend(@Body() payload: BanDto, @Param('id') id: string): Promise<SuccessRO> {
    return this.dealService.suspend(id, payload)
  }

  @Get('variant/:id/donation/calculation')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Get variant donation calculation' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async calculateDonation(@Param('id') id: string): Promise<PaginateRO> {
    return this.dealService.calculateDonation(id)
  }

  @Delete('delete/:dealId/review/:reviewId')
  @ApiBearerAuth()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  @UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Delete deal review' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal/Review does not exist'))
  async deleteReview(
    @Param('dealId') dealId: string,
    @Param('reviewId') reviewId: string,
  ): Promise<SuccessRO> {
    return this.dealService.deleteReview(dealId, reviewId)
  }
}
