import { Controller, Get, Query, ValidationPipe } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
} from '@app/src/shared/swagger/responses'
import { PaginateRO } from '@app/src/shared/dto'
import { VariantOptionService } from './variant-option.service'
import { QueryDto } from './dto'

@ApiTags('Deal Variant Options')
@Controller('deal/variant-options')
export class VariantOptionController {
  constructor(private readonly variantOptionService: VariantOptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get deal variant options' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.variantOptionService.show(query)
  }
}
