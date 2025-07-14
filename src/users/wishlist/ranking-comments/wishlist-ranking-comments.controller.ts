import {
  Post,
  Get,
  Param,
  Body,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { User, UserType, SkipAuth } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import {
  GetResponse,
  BadRequestResponse,
  ForbiddenResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { CreateRankingCommentDto, QueryRankingCommentsDto } from './dto'
import { WishlistRankingCommentsService } from './wishlist-ranking-comments.service'

@ApiTags('Wishlist Ranking Comments')
@Controller('wishlist/ranking')
export class WishlistRankingCommentsController {
  constructor(private readonly commentsService: WishlistRankingCommentsService) {}

  @Post(':rankedUserId/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Post a comment on a wishlist ranking entry' })
  @ApiParam({
    name: 'rankedUserId',
    description: 'ID of the user being ranked',
    type: String,
    format: 'uuid',
  })
  @ApiCreatedResponse({ description: 'Comment created successfully' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User or Parent Comment not found'))
  create(
    @User('id') commenterId: string,
    @Body() payload: CreateRankingCommentDto,
    @Param('rankedUserId', ParseUUIDPipe) rankedUserId: string,
  ): Promise<SuccessRO> {
    return this.commentsService.create(rankedUserId, commenterId, payload)
  }

  @Get('comments')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiBadRequestResponse(BadRequestResponse)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get comments for a wishlist ranking entry' })
  @ApiNotFoundResponse(GetResponse('User or Parent Comment not found'))
  show(@Query() query: QueryRankingCommentsDto, @User('id') userId?: string): Promise<PaginateRO> {
    return this.commentsService.show(query, userId)
  }

  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like/Unlike a ranking comment' })
  @ApiParam({
    name: 'commentId',
    description: 'ID of the comment to like',
    type: String,
    format: 'uuid',
  })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Comment not found'))
  @ApiOkResponse({ type: SuccessRO, description: 'Comment liked successfully' })
  toggleCommentLike(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @User('id') userId: string,
  ): Promise<SuccessRO> {
    return this.commentsService.toggleCommentLike(commentId, userId)
  }
}
