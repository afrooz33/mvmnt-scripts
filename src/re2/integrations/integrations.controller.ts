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
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { UserTypes } from '@app/src/shared/enums'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { MySearchDto } from '@app/src/shared/base'
import { FilterDeleted } from '@app/src/shared/decorators'
import { UserType, User } from '@app/src/shared/auth/decorators'
import { JwtAuthGuard, RolesGuard } from '@app/src/shared/auth/guards'
import { VerifyShopifyTokenInterceptor } from '@app/src/shared/interceptors'
import { IntegrationsService } from './integrations.service'
import {
  CreateDto,
  AppProductDto,
  CloneSettingDto,
  ChangeStatusDto,
  DeleteSettingDto,
  QueryCartDrawerDto,
  QueryCartBannerDto,
  CreateCartDrawerDto,
  UpdateCartDrawerDto,
  CreateCartBannerDto,
  UpdateCartBannerDto,
  QuerySalePortionDto,
  CreateSalePortionDto,
  UpdateSalePortionDto,
} from './dto'
import { IntegrationSettingType, ShopifyResource } from './enums'

@ApiTags('RE2 Integrations')
@Controller('re2/integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  /**
   * APi to manage integrations
   */
  @Get()
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 get all integrations' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  show(@Query(new FilterDeleted()) query: MySearchDto, @User('id') userId: string) {
    return this.integrationsService.show(query, userId)
  }

  @Post()
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 create integration' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  create(@Body() payload: CreateDto, @User('id') userId: string) {
    return this.integrationsService.create(payload, userId)
  }

  @Delete('settings/:integrationId/:shopifyIntegrationId')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 delete integration settings' })
  @ApiNotFoundResponse(GetResponse('Integration setting does not exist'))
  deleteSetting(
    @User('id') userId: string,
    @Body() payload: DeleteSettingDto,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.deleteSetting(
      userId,
      payload,
      integrationId,
      shopifyIntegrationId,
    )
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 delete integration' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  delete(@Param('id') id: string, @User('id') userId: string) {
    return this.integrationsService.delete(id, userId)
  }

  /**
   * APi to manage shopify sale portion settings
   */
  @Get(':id/sale-portion-settings')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 get one shopify integration sale portion settings' })
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  showOneSalePortion(@Param('id') id: string, @User('id') userId: string) {
    return this.integrationsService.showOneSalePortion(id, userId)
  }

  @Get('sale-portion-settings')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 get all shopify integration sale portion settings' })
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  showSalePortion(
    @Query(new FilterDeleted()) query: QuerySalePortionDto,
    @User('id') userId: string,
  ) {
    return this.integrationsService.showSalePortion(query, userId)
  }

  @Post(':integrationId/sale-portion-setting/:shopifyIntegrationId')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 create integration sale portion settings' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  createSalePortion(
    @Body() payload: CreateSalePortionDto,
    @User('id') userId: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.createSalePortion(
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  @Put(':integrationId/sale-portion-setting/:shopifyIntegrationId')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 update integration sale portion settings' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  updateSalePortion(
    @Body() payload: UpdateSalePortionDto,
    @User('id') userId: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.updateSalePortion(
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  /**
   * APi to manage shopify cart banner settings
   */
  @Get(':id/cart-banner-settings')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 get shopify integration cart banner settings' })
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  showOneCartBanner(@Param('id') id: string, @User('id') userId: string) {
    return this.integrationsService.showOneCartBanner(id, userId)
  }

  @Get('cart-banner-settings')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 get all shopify integration cart banner settings' })
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  showCartBanner(
    @Query(new FilterDeleted()) query: QueryCartBannerDto,
    @User('id') userId: string,
  ) {
    return this.integrationsService.showCartBanner(query, userId)
  }

  @Post(':integrationId/cart-banner/:shopifyIntegrationId')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 create integration cart banner settings' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  createCartBanner(
    @Body() payload: CreateCartBannerDto,
    @User('id') userId: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.createCartBanner(
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  @Put(':integrationId/cart-banner/:shopifyIntegrationId')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 update integration cart banner settings' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  updateCartBanner(
    @Body() payload: UpdateCartBannerDto,
    @User('id') userId: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.updateCartBanner(
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  /**
   * APi to manage shopify cart drawer settings
   */
  @Get(':id/cart-drawer-settings')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 get shopify integration cart drawer settings' })
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  showOneCartDrawer(@Param('id') id: string, @User('id') userId: string) {
    return this.integrationsService.showOneCartDrawer(id, userId)
  }

  @Get('cart-drawer-settings')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 get all shopify integration cart drawer settings' })
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  showCartDrawer(
    @Query(new FilterDeleted()) query: QueryCartDrawerDto,
    @User('id') userId: string,
  ) {
    return this.integrationsService.showCartDrawer(query, userId)
  }

  @Post(':integrationId/cart-drawer/:shopifyIntegrationId')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 create integration cart drawer settings' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  createCartDrawer(
    @Body() payload: CreateCartDrawerDto,
    @User('id') userId: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.createCartDrawer(
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  @Put(':integrationId/cart-drawer/:shopifyIntegrationId')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 update integration cart drawer settings' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  updateCartDrawer(
    @Body() payload: UpdateCartDrawerDto,
    @User('id') userId: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.updateCartDrawer(
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  /**
   * Common APi to change status of integration settings
   */
  @Put(':integrationId/pre/change-status/:shopifyIntegrationId/:type/:id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  @ApiOperation({ summary: 'RE2 pre check before change status' })
  @ApiParam({ enum: IntegrationSettingType, name: 'type' })
  preChangeStatus(
    @Param('type') type: IntegrationSettingType,
    @User('id') userId: string,
    @Param('id') id: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.preChangeStatus(
      id,
      integrationId,
      shopifyIntegrationId,
      userId,
      type,
    )
  }

  @Put(':integrationId/change-status/:shopifyIntegrationId/:id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  @ApiOperation({ summary: 'RE2 update integration setting change status' })
  changeStatus(
    @Body() payload: ChangeStatusDto,
    @User('id') userId: string,
    @Param('id') id: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
  ) {
    return this.integrationsService.changeStatus(
      id,
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  /**
   * Common APi to clone integration settings
   */
  @Put('clone/:integrationId/:shopifyIntegrationId/:id')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'RE2 clone integration settings' })
  @ApiNotFoundResponse(GetResponse('Resoruce does not exist'))
  clone(
    @User('id') userId: string,
    @Param('id') id: string,
    @Param('integrationId') integrationId: string,
    @Param('shopifyIntegrationId') shopifyIntegrationId: string,
    @Body() payload: CloneSettingDto,
  ) {
    return this.integrationsService.cloneSettings(
      id,
      integrationId,
      shopifyIntegrationId,
      userId,
      payload,
    )
  }

  /**
   * APi to Shopify app
   */
  @Get('shopify/app/:shop/install')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 check if shop has installed shopify app' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Shopify app not installed for the specified shop'))
  appInstalled(@Param('shop') shop: string, @User('id') userId: string) {
    return this.integrationsService.appInstalled(shop, userId)
  }

  @Get('shopify/:shop/:resource')
  @ApiBearerAuth()
  @UserType(UserTypes.RE2)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'RE2 get shop products with filter' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiParam({ enum: ShopifyResource, name: 'resource' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  filterResource(
    @Query() query: AppProductDto,
    @User('id') userId: string,
    @Param('shop') shop: string,
    @Param('resource') resource: ShopifyResource,
  ) {
    return this.integrationsService.filterResource(query, userId, shop, resource)
  }

  /**
   * APi from shopify to get settings
   */
  @Get('shopify/:shop/:type/settings')
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @UseInterceptors(VerifyShopifyTokenInterceptor)
  @ApiParam({ enum: IntegrationSettingType, name: 'type' })
  @ApiOperation({ summary: 'RE2 get shopify shop settings' })
  @ApiNotFoundResponse(GetResponse('Integration does not exist'))
  @ApiHeader({
    required: true,
    name: 'x-shopify-token',
    description: 'Shopify store token',
  })
  shopifySetting(@Param('shop') shop: string, @Param('type') type: IntegrationSettingType) {
    return this.integrationsService.shopifySetting(type, shop)
  }
}
