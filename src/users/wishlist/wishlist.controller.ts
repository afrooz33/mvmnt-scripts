import {
  Body,
  Post,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Get,
  Query,
  Param,
  Put,
  Patch,
  Delete,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { WishlistService } from './wishlist.service'
import {
  QueryDto,
  QueryItemDto,
  AddDetailsDto,
  ReorderItemDto,
  MoveWishlistDto,
  UpdateWishlistDto,
  CreateWishlistDto,
  PublicListQueryDto,
  PublicListItemQueryDto,
  PublicPurchaseHistoryQueryDto,
} from './dto'

@ApiTags('User Wishlist')
@Controller('user/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('public/ranking/:userId')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get wishlist ranking by userId' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  publicRanking(
    @Param('userId') userId: string,
    @Query() query: MyPaginateDto,
    @User('id') user: string,
  ) {
    return this.wishlistService.publicRanking(userId, query, user)
  }

  @Get('public/wishlist/get/:id')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get single wishlist details by id public api' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  publicGetWishlist(@Param('id') id: string) {
    return this.wishlistService.publicGetWishlist(id)
  }

  @Get('public/wishlist/:id/details')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get wishlist details by id public api' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  publicWishlistDetail(@Query() query: MyPaginateDto, @Param('id') id: string) {
    return this.wishlistService.publicWishlistDetail(id, query)
  }

  @Get('public/nonprofit/get/:userId/wishlist')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get all nonprofit users wishlists public api' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  nonprofitWishlist(@Query() query: PublicListQueryDto, @Param('userId') userId: string) {
    return this.wishlistService.publicList(query, userId, true)
  }

  @Get('public/nonprofit/get/all/list-items')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get all nonprofit users wishlist items public api' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  nonprofitItems(@Query() query: PublicListItemQueryDto) {
    return this.wishlistService.publicListItems(query, null)
  }

  @Get('public/nonprofit/:userId/list-items')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get nonprofit user wishlist items public api' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  publicListItems(@Query() query: PublicListItemQueryDto, @Param('userId') userId: string) {
    return this.wishlistService.publicListItems(query, userId)
  }

  @Get('public/purchase/history')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get wishlist purchase history by buyer' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  publicPurchaseHistory(@Query() query: PublicPurchaseHistoryQueryDto) {
    return this.wishlistService.publicPurchaseHistory(query)
  }

  @Get('public/:userId/list')
  @UsePipes(new ValidationPipe())
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'Get all wishlist of the user public api' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  publicList(@Query() query: PublicListQueryDto, @Param('userId') userId: string) {
    return this.wishlistService.publicList(query, userId)
  }

  @Get('variant-wishlists/:variantId')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a list of wishlist in which the variant is wishlisted' })
  @ApiQuery({ name: 'onlyNonprofit', type: Boolean, required: false })
  async variantWishlists(
    @Param('variantId') variantId: string,
    @User('id') userId?: string,
    @Query('onlyNonprofit') onlyNonprofit?: boolean,
  ): Promise<boolean> {
    return this.wishlistService.variantWishlists(userId, variantId, onlyNonprofit)
  }

  @Get()
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
  @ApiOperation({ summary: 'List all wishlist of the user' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  show(@Query() query: QueryDto, @User('id') user: string) {
    return this.wishlistService.show(query, user)
  }

  @Get('items/:id')
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
  @ApiOperation({ summary: 'List items within wishlist of the user by id' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showItems(@Param('id') id: string, @User('id') user: string, @Query() query: QueryItemDto) {
    return this.wishlistService.showItems(id, user, query)
  }

  @Get(':id')
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
  @ApiOperation({ summary: 'List wishlist of the user by id' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showOne(@Param('id') id: string, @User('id') user: string) {
    return this.wishlistService.showOne(id, user)
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
  @ApiOperation({ summary: 'Create wishlist of the user' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  create(@Body() payload: CreateWishlistDto, @User('id') user: string) {
    return this.wishlistService.create(payload, user)
  }

  @Put('add-details')
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
  @ApiOperation({ summary: 'Add comments, needs and priority details to wishlist item' })
  @ApiNotFoundResponse(GetResponse('User/wishlist does not exist'))
  addDetails(@Body() payload: AddDetailsDto, @User('id') user: string) {
    return this.wishlistService.addDetails(payload, user)
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
  @ApiOperation({ summary: 'Update wishlist of the user' })
  @ApiNotFoundResponse(GetResponse('User/wishlist does not exist'))
  update(@Body() payload: UpdateWishlistDto, @User('id') user: string) {
    return this.wishlistService.updateWishlist(payload, user)
  }

  @Put(':action/:variantId/:wishlistId')
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
  @ApiOperation({ summary: 'Add or remove item to wishlist' })
  @ApiNotFoundResponse(GetResponse('User/deal does not exist'))
  @ApiParam({ name: 'action', enum: ['add', 'remove'] })
  addToList(
    @Param('action') action: string,
    @Param('variantId') variantId: string,
    @Param('wishlistId') wishlistId: string,
    @User('id') user: string,
  ) {
    return this.wishlistService.addToList(action, variantId, wishlistId, user)
  }

  @Patch('move')
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
  @ApiOperation({ summary: 'Move item to another wishlist' })
  @ApiNotFoundResponse(GetResponse('User/deal does not exist'))
  move(@Body(new ValidationPipe()) payload: MoveWishlistDto, @User('id') user: string) {
    return this.wishlistService.move(payload, user)
  }

  @Patch('reorder')
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
  @ApiOperation({ summary: 'Reorder wishlist item' })
  @ApiNotFoundResponse(GetResponse('User/deal does not exist'))
  reorder(@Body() payload: ReorderItemDto, @User('id') user: string) {
    return this.wishlistService.reorder(payload, user)
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
  @ApiOperation({ summary: 'Delete wishlist' })
  @ApiNotFoundResponse(GetResponse('User/deal does not exist'))
  delete(@Param('id') id: string, @User('id') user: string) {
    return this.wishlistService.delete(id, user)
  }
}
