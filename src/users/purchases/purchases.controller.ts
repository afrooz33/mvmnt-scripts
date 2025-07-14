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
  Get,
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
import { UserTypes } from '@app/src/shared/enums'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { PurchaseService } from './purchases.service'
import { QueryDto } from './dto'

@ApiTags('User deal purchase/sold history')
@Controller('user/deal')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get('purchase/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'Purchase history - Get all deals purchased by user' })
  async show(@Query() query: QueryDto, @User('id') userId: string) {
    return await this.purchaseService.show(query, userId)
  }

  @Get(':id/purchase/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  @ApiOperation({ summary: 'Purchase history - Get purchase history by order id' })
  async showOne(@Param('id') id: string, @User('id') userId: string) {
    return await this.purchaseService.showOne(id, userId)
  }

  @Get('sold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Get all deals sold by user' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async sold(@Query() query: QueryDto, @User('id') userId: string): Promise<PaginateRO> {
    return await this.purchaseService.sold(query, userId, false)
  }

  @Get('export/sold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Export - Get all deals sold by user' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async exportSold(@Query() query: QueryDto, @User('id') userId: string): Promise<any> {
    return await this.purchaseService.sold(query, userId, true)
  }

  @Patch('send/:dealId/:id/item')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Send item to the buyer' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  async sendItem(
    @Param('dealId') dealId: string,
    @Param('id') id: string,
    @User('id') userId: string,
  ): Promise<any> {
    return await this.purchaseService.sendItem(id, dealId, userId)
  }
}
