import {
  Body,
  Get,
  Post,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Delete,
  Param,
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
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { WishlistCommentService } from './comments.service'
import { QueryDto, CreateWishlistCommentDto } from './dto'

@ApiTags('Wishlist Comments')
@Controller('wishlist/comments')
export class WishlistCommentController {
  constructor(private readonly wishlistCommentService: WishlistCommentService) {}

  @Get()
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'List all wishlist variant comments' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  show(@Query() query: QueryDto, @User('id') user: string) {
    return this.wishlistCommentService.show(query, user)
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
  @ApiOperation({ summary: 'Post comment on wishlist item' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  create(@Body() payload: CreateWishlistCommentDto, @User('id') user: string) {
    return this.wishlistCommentService.create(payload, user)
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
  @ApiOperation({ summary: 'Delete wishlist comment' })
  @ApiNotFoundResponse(GetResponse('User/deal does not exist'))
  delete(@Param('id') id: string, @User('id') userId: string) {
    return this.wishlistCommentService.delete(id, { user: { id: userId } })
  }
}
