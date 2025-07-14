import {
  ApiTags,
  ApiHeader,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Body, Post, UsePipes, Controller, ValidationPipe, UseInterceptors } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import {
  GetResponse,
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { VerifyShopifyTokenInterceptor } from '@app/src/shared/interceptors'
import { WebhooksServices } from './webhooks.services'
import { ShopifyOrderDto } from './dto'

@ApiTags('RE2 Webhooks')
@Controller('re2/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksServices: WebhooksServices) {}

  @Post('shopify/process-order')
  @UsePipes(new ValidationPipe())
  @ApiOkResponse({ type: SuccessRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @UseInterceptors(VerifyShopifyTokenInterceptor)
  @ApiOperation({ summary: 'RE2 save shopify customer/donation' })
  @ApiNotFoundResponse(GetResponse('RE2 does not exist'))
  @ApiHeader({
    required: true,
    name: 'x-shopify-token',
    description: 'Shopify store token',
  })
  processOrder(@Body() payload: ShopifyOrderDto) {
    return this.webhooksServices.processOrder(payload)
  }
}
