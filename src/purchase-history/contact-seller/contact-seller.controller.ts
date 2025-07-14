import { UseGuards, Controller, Post, Get, Body, Param, Put, Query, Patch } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { ContactSellerService } from './contact-seller.service'
import { QueryDto, ReplyDto, CreateContactRequestDto } from './dto'
import { ContactSellerRequestEntity } from './entities/contact-seller-request.entity'

@ApiTags('Purchase History - Contact Seller')
@Controller('purchase-history/contact-seller')
@UseGuards(JwtAuthGuard, RolesGuard)
@UserType(
  UserTypes.BUSINESS_COMPANY,
  UserTypes.INDIVIDUAL_PERSONAL,
  UserTypes.INDIVIDUAL_INFLUENCER,
  UserTypes.BUSINESS_SOLE_PROPRIETOR,
)
@ApiBearerAuth()
export class ContactSellerController {
  constructor(private readonly contactSellerService: ContactSellerService) {}

  @Post()
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiCreatedResponse({ type: ContactSellerRequestEntity })
  @ApiOperation({ summary: 'Buyer: Initiate contact with seller about an order' })
  create(
    @Body() payload: CreateContactRequestDto,
    @User('id') buyerId: string,
  ): Promise<ContactSellerRequestEntity> {
    return this.contactSellerService.create(payload, buyerId)
  }

  @Get()
  @ApiOperation({ summary: 'Buyer: List your contact requests with sellers' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  show(@User('id') buyerId: string, @Query() query: QueryDto): Promise<PaginateRO> {
    return this.contactSellerService.show(query, buyerId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buyer: Get details of a specific contact request' })
  @ApiOkResponse({ type: ContactSellerRequestEntity })
  @ApiNotFoundResponse(GetResponse('Contact request not found'))
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  showOne(
    @Param('id') requestId: string,
    @User('id') buyerId: string,
  ): Promise<ContactSellerRequestEntity> {
    return this.contactSellerService.showOne(requestId, buyerId)
  }

  @Put(':id/reply')
  @ApiOperation({ summary: 'Buyer: Add a reply to a contact request' })
  @ApiOkResponse({ type: ContactSellerRequestEntity })
  @ApiNotFoundResponse(GetResponse('Contact request not found'))
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  reply(
    @Param('id') requestId: string,
    @User('id') buyerId: string,
    @Body() payload: ReplyDto,
  ): Promise<ContactSellerRequestEntity> {
    return this.contactSellerService.reply(requestId, buyerId, payload)
  }

  @Patch(':id/close')
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOkResponse({ type: ContactSellerRequestEntity })
  @ApiOperation({ summary: 'Buyer: Close a contact request' })
  @ApiNotFoundResponse(GetResponse('Contact request not found'))
  close(
    @Param('id') requestId: string,
    @User('id') buyerId: string,
  ): Promise<ContactSellerRequestEntity> {
    return this.contactSellerService.close(requestId, buyerId)
  }
}
