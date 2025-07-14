import {
  Body,
  Post,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Put,
  Delete,
  Param,
  Get,
  Query,
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
import { FilterDeleted } from '@app/src/shared/decorators'
import { User, UserType } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { DeliveryCarrierService } from './carrier.service'
import { QueryDeliveryCarrierDto, UpdateDeliveryCarrierDto, CreateDeliveryCarrierDto } from './dto'

@ApiTags('Delivery Settings - Carrier')
@Controller('users/delivery-settings/carrier')
export class DeliveryCarrierController {
  constructor(private readonly deliveryCarrierService: DeliveryCarrierService) {}

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
  @ApiOperation({ summary: 'Get all delivery carrier created by user' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  show(@Query(new FilterDeleted()) query: QueryDeliveryCarrierDto, @User('id') userId: string) {
    return this.deliveryCarrierService.show(query, userId)
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
  @ApiOperation({ summary: 'Get single delivery carrier created by user' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  showOne(
    @Param('id') id: string,
    @Query(new FilterDeleted()) query: QueryDeliveryCarrierDto,
    @User('id') userId: string,
  ) {
    return this.deliveryCarrierService.showOne(id, query, userId)
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
  @ApiOperation({ summary: 'Create delivery carrier' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  create(@Body() payload: CreateDeliveryCarrierDto, @User('id') userId: string) {
    return this.deliveryCarrierService.create(payload, userId)
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
  @ApiOperation({ summary: 'Update delivery carrier' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  update(@Body() payload: UpdateDeliveryCarrierDto, @User('id') userId: string) {
    return this.deliveryCarrierService.update(payload, userId)
  }

  @Delete(':id/delivery-carriers')
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
  @ApiOperation({ summary: 'Delete delivery carrier' })
  @ApiNotFoundResponse(GetResponse('User does not exist'))
  delete(@Param('id') id: string, @User('id') userId: string) {
    return this.deliveryCarrierService.delete(id, userId)
  }
}
