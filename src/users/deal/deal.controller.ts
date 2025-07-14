import { Request } from 'express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { FileInterceptor } from '@nestjs/platform-express'
import { UserTypes } from '@app/src/shared/enums'
import { SkipAuth, User, UserType } from '@app/src/shared/auth/decorators'
import { DeleteRecordDto, PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { DealService } from './deal.service'
import {
  QueryDto,
  ImportCsvDto,
  ListQueryDto,
  CreateDealDto,
  UpdateDealDto,
  DeleteDealDto,
  PrePurchaseDto,
  GetVariantIdDto,
} from './dto'
import { ShowOneDealService } from './services/showOne.service'

@ApiTags('Users Deals')
@Controller('user/deals')
export class DealController {
  constructor(
    private readonly dealService: DealService,
    private readonly showOneDealService: ShowOneDealService,
  ) {}

  @Get('pre-purchase')
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
  @ApiOperation({ summary: 'User get pre-purchase details' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  prePurchase(@Query() query: PrePurchaseDto, @User('id') userId: string) {
    return this.dealService.prePurchase(query, userId)
  }

  @Get('donation-source/by/genre')
  @ApiOperation({ summary: 'Get nonprofit by genre' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  nonprofitByGenre(@Query('genre') genre: string) {
    return this.dealService.nonprofitByGenre(genre)
  }

  @Get('public/:dealId/variantId')
  @ApiOperation({ summary: 'Public APi to get variant id from options' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  getVariantId(
    @Query(new ValidationPipe()) query: GetVariantIdDto,
    @Param('dealId') dealId: string,
  ) {
    return this.dealService.getVariantId(query, dealId)
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginateRO })
  @ApiOperation({ summary: "Get logged in user's deals" })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  getAll(@Query(new ValidationPipe()) query: QueryDto, @User('id') user: string) {
    return this.dealService.show(query, user)
  }

  @Get(':variantId/show-editable-inventory')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Show editable inventory for variant' })
  shouldShowEditableInventory(@Param('variantId') variantId: string, @User('id') user: string) {
    return this.dealService.showEditableInventory(variantId, user)
  }

  @Get('by/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: PaginateRO })
  @ApiOperation({ summary: "Get logged in user's deal" })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  getOne(@Param('id') id: string, @User('id') userId: string) {
    return this.dealService.getOne(id, userId)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'User create deal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  create(@Body() payload: CreateDealDto, @User('id') user: string) {
    return this.dealService.create(payload, user)
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'User update deal' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  update(@Body() payload: UpdateDealDto, @User('id') user: string) {
    return this.dealService.create(payload, user)
  }

  @Get('get/public')
  @ApiOperation({
    summary: 'Public APi to get all deals',
  })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  publicDeal(@Query(new ValidationPipe()) query: ListQueryDto) {
    return this.dealService.listAll(query)
  }

  @Get(':id/public')
  @ApiOperation({
    summary: 'Public APi to get deal by id',
  })
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
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  showOne(@Param('id') id: string, @Req() req: Request, @User('id') user: string) {
    return this.showOneDealService.execute(id, user, req)
  }

  @Delete('delete-many')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'User delete multiple scheduled deal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  deleteMany(@Body() payload: DeleteRecordDto, @User('id') user: string) {
    return this.dealService.deleteMany(payload, user)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'User delete deal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  delete(@Param('id') id: string, @User('id') user: string, @Body() payload: DeleteDealDto) {
    return this.dealService.delete(id, user, payload)
  }

  @Post('import/csv')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(UserTypes.BUSINESS_COMPANY, UserTypes.BUSINESS_SOLE_PROPRIETOR)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiConsumes('multipart/form-data')
  @ApiForbiddenResponse(ForbiddenResponse)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  @ApiOperation({ summary: 'Business user import csv deals' })
  import(
    @UploadedFile() file: Express.Multer.File,
    @User('id') user: string,
    @Body() payload: ImportCsvDto,
  ) {
    return this.dealService.import(file, user, payload)
  }

  @Put(':id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'User duplicate draft deal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  duplicate(@Param('id') id: string, @User('id') user: string) {
    return this.dealService.duplicate(id, user)
  }

  @Put(':id/hide/buynow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiOperation({ summary: 'User hide buynow deal' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiNotFoundResponse(GetResponse('Deal does not exist'))
  changeStatus(@Param('id') id: string, @User('id') user: string) {
    return this.dealService.changeStatus(id, user)
  }

  @Get('applicable/shipping-origin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
    UserTypes.BUSINESS_COMPANY,
  )
  @ApiBearerAuth()
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiQuery({ name: 'deal', required: false })
  @ApiQuery({ name: 'variant', required: false })
  @ApiOperation({ summary: 'Get applicable deal shipping origin' })
  applicableShippingOrigin(
    @Param('deal') id: string,
    @User('id') user: string,
    @Query('variant') variant: string,
  ) {
    return this.dealService.applicableShippingOrigin(user, id, variant)
  }
}
