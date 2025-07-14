import { Get, Put, Body, Query, Patch, Param, UseGuards, Controller } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import {
  GetResponse,
  BadRequestResponse,
  ForbiddenResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { ContactSellerRequestEntity } from '@app/src/purchase-history/contact-seller/entities/contact-seller-request.entity'
import { QueryDto, SellerReplyDto } from './dto'
import { ContactRequestsService } from './contact-requests.service'

@ApiTags('Sales History - Contact Requests')
@Controller('sales-history/contact-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@UserType(
  UserTypes.INDIVIDUAL_INFLUENCER,
  UserTypes.INDIVIDUAL_PERSONAL,
  UserTypes.BUSINESS_SOLE_PROPRIETOR,
  UserTypes.BUSINESS_COMPANY,
)
@ApiBearerAuth()
export class ContactRequestsController {
  constructor(private readonly contactRequestsService: ContactRequestsService) {}

  @Get('list/all')
  @ApiOperation({ summary: 'Seller: List incoming contact requests from buyers' })
  @ApiOkResponse({ description: 'Paginated list of contact requests.' })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  show(@User('id') sellerId: string, @Query() query: QueryDto): Promise<PaginateRO> {
    return this.contactRequestsService.show(sellerId, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Seller: Get details of a specific contact request' })
  @ApiOkResponse({ type: ContactSellerRequestEntity })
  @ApiNotFoundResponse(GetResponse('Contact request not found'))
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  showOne(
    @Param('id') requestId: string,
    @User('id') sellerId: string,
  ): Promise<ContactSellerRequestEntity> {
    return this.contactRequestsService.showOne(requestId, sellerId)
  }

  @Put(':id/reply')
  @ApiOperation({ summary: 'Seller: Add a reply to a contact request' })
  @ApiOkResponse({ type: ContactSellerRequestEntity })
  @ApiNotFoundResponse(GetResponse('Contact request not found'))
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  reply(
    @Param('id') requestId: string,
    @User('id') sellerId: string,
    @Body() replyDto: SellerReplyDto,
  ): Promise<ContactSellerRequestEntity> {
    return this.contactRequestsService.reply(requestId, sellerId, replyDto)
  }

  @Patch(':id/close')
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOkResponse({ type: ContactSellerRequestEntity })
  @ApiOperation({ summary: 'Seller: Close a contact request' })
  @ApiNotFoundResponse(GetResponse('Contact request not found'))
  close(
    @Param('id') requestId: string,
    @User('id') sellerId: string,
  ): Promise<ContactSellerRequestEntity> {
    return this.contactRequestsService.close(requestId, sellerId)
  }
}
