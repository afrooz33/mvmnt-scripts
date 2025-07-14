import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common'
import {
  ApiTags,
  ApiHeader,
  ApiOperation,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { AcceptLanguage } from '@app/src/shared/decorators'
import { BrandService } from './brand.service'
import { QueryDto } from './dto'

@ApiTags('Users Brand')
@Controller('user/brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('alphabetically')
  @ApiOperation({ summary: 'Get all brands grouped with alphabets' })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiHeader({
    required: true,
    name: 'Accept-Language',
    description: 'Language code',
    enum: ['en-US', 'hi-IN', 'zh-CN', 'es-ES', 'fr-FR', 'ja-JP', 'it-IT', 'de-DE'],
  })
  @CacheTTL(60 * 60 * 24)
  @UseInterceptors(CacheInterceptor)
  getAlphabetically(
    @Query() query: QueryDto,
    @AcceptLanguage()
    language: string,
  ) {
    return this.brandService.getAlphabetically(query, language)
  }
}
