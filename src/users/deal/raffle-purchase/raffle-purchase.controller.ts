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
import {
  Get,
  Post,
  Param,
  Query,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
} from '@nestjs/common'
import { UserTypes } from '@app/src/shared/enums'
import { MyPaginateDto } from '@app/src/shared/base'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { RafflePurchaseService } from './raffle-purchase.service'

@ApiTags('User Deal Raffle Purchase')
@Controller('user/deal/raffle-purchases')
export class RafflePurchaseController {
  constructor(private readonly rafflePurchaseService: RafflePurchaseService) {}

  @Get(':dealId/entry/calculation/:quantity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Calculate the entry for the raffle deal.' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  entryCalculation(
    @User('id') userId: string,
    @Param('dealId') dealId: string,
    @Param('quantity') quantity: number,
  ) {
    return this.rafflePurchaseService.entryCalculation(dealId, userId, quantity)
  }

  @Post(':dealId/free-entry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Create a free entry for the raffle deal.' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  freeEntry(@User('id') userId: string, @Param('dealId') dealId: string) {
    return this.rafflePurchaseService.freeEntry(dealId, userId)
  }

  @Get('public/:dealId/winners')
  @SkipAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Public: Get a list of winner for the raffle deal.' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  publicWinners(
    @User('id') userId: string,
    @Query() query: MyPaginateDto,
    @Param('dealId') dealId: string,
  ) {
    return this.rafflePurchaseService.publicWinners(query, dealId, userId)
  }

  @Get(':dealId/winners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Get a list of winner for the raffle deal.' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  winners(
    @User('id') userId: string,
    @Query() query: MyPaginateDto,
    @Param('dealId') dealId: string,
  ) {
    return this.rafflePurchaseService.winners(query, dealId, userId)
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
  @ApiOperation({ summary: 'Get a list of buyer for the raffle deal' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  buyer(
    @User('id') userId: string,
    @Query() query: MyPaginateDto,
    @Param('dealId') dealId: string,
  ) {
    return this.rafflePurchaseService.buyer(query, dealId, userId)
  }
}
