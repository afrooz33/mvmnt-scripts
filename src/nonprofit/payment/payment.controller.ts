import { Controller, Get, UseGuards, ValidationPipe, Query } from '@nestjs/common'
import {
  UnauthorizedResponse,
  BadRequestResponse,
  ForbiddenResponse,
} from '@app/src/shared/swagger/responses'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiTags,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { PaymentService } from './payment.service'
import { QueryDto } from './dto'

@ApiTags('Nonprofit Payments')
@Controller('nonprofit/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Payments - List of donations' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.paymentService.show(query, userId)
  }

  @Get('top-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Payments - Top heading statistics' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async topStats(
    @Query(new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<PaginateRO> {
    return this.paymentService.topStats(query, userId)
  }

  @Get('export-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.NONPROFIT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Payments - export' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async exportPayment(
    @Query(new ValidationPipe()) query: QueryDto,
    @User('id') userId: string,
  ): Promise<any> {
    return this.paymentService.show(query, userId, true)
  }
}
