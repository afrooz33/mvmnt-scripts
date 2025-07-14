import { Request, Response } from 'express'
import {
  Req,
  Get,
  Res,
  Put,
  Body,
  Post,
  Param,
  Patch,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { BuynowService } from './buynow.service'
import { QueryDto, CreateCartDto } from './dto'

@ApiTags('Users Deal BuyNow')
@Controller('user/deal/buynow')
export class BuynowController {
  constructor(private readonly buynowService: BuynowService) {}

  @Get('total/items')
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
  @ApiNotFoundResponse(GetResponse('Cart does not exist'))
  @ApiOperation({ summary: 'Get count of total items in cart' })
  totalItemCount(@User('id') user: string, @Req() req: Request) {
    return this.buynowService.totalItemCount(user, req)
  }

  @Get('cart/:id/summary')
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
  @ApiOperation({ summary: 'Get user cart summary' })
  @ApiNotFoundResponse(GetResponse('Cart does not exist'))
  summary(@Param('id') id: string, @User('id') user: string, @Req() req: Request) {
    return this.buynowService.summary(id, user, req)
  }

  @Get('cart')
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
  @ApiOperation({ summary: 'User get buynow deal cart' })
  @ApiNotFoundResponse(GetResponse('Cart does not exist'))
  show(@Query() query: QueryDto, @Req() req: Request, @User('id') user: string) {
    return this.buynowService.toggleCustomPagination().show(query, req, user)
  }

  @Post('add-to-cart')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOperation({ summary: 'User/guest add item into cart' })
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  create(
    @Body() payload: CreateCartDto,
    @Req() req: Request,
    @Res() res: Response,
    @User('id') user: string,
  ) {
    return this.buynowService.create(payload, req, res, user)
  }

  @Put(':cartId/update-cart/:dealId/:quantity/:variantId')
  @UsePipes(new ValidationPipe())
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
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  @ApiOperation({ summary: 'Update cart variant quantity' })
  updateCartQty(
    @Param('cartId') cartId: string,
    @Param('dealId') dealId: string,
    @Param('variantId') variantId: string,
    @Param('quantity') quantity: number,
    @User('id') user: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.buynowService.updateCartQty(cartId, dealId, variantId, quantity, user, req, res)
  }

  @Patch('mark-shipped/:cartId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.BUSINESS_SOLE_PROPRIETOR, UserTypes.BUSINESS_COMPANY)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Mark deal order as shipped' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  markOrderShipped(@Param('cartId') cartId: string, @User('id') userId: string) {
    return this.buynowService.markShipped(cartId, userId)
  }

  @Get(':dealId/buyers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Get a list of buyer for the buynow deal.' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  buyer(
    @User('id') userId: string,
    @Query() query: MyPaginateDto,
    @Param('dealId') dealId: string,
  ) {
    return this.buynowService.buyer(query, dealId, userId)
  }
}
