import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { Controller, Get, Query, UseInterceptors, ValidationPipe } from '@nestjs/common'
import {
  ApiTags,
  ApiHeader,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { AcceptLanguage, FilterDeleted } from '@app/src/shared/decorators'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { QueryDto } from './dto'
import { DealCategoryService } from './category.service'

@ApiTags('Deal Category')
@Controller('deal/categories')
export class DealCategoryController {
  constructor(private readonly dealCategoryService: DealCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get/filter deal categories' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Language code',
    required: true,
    enum: ['en-US', 'hi-IN', 'zh-CN', 'es-ES', 'fr-FR', 'ja-JP', 'it-IT', 'de-DE'],
  })
  @CacheTTL(60 * 60 * 24)
  @UseInterceptors(CacheInterceptor)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
    @AcceptLanguage()
    language: string,
  ): Promise<PaginateRO> {
    return this.dealCategoryService.show(query, language)
  }
}
