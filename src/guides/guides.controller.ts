import { Get, Query, Controller, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiHeader,
} from '@nestjs/swagger'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { AcceptLanguage } from '@app/src/shared/decorators'
import { BadRequestResponse } from '@app/src/shared/swagger/responses'
import { GuidesQueryDto } from './dto'
import { GuidesService } from './guides.service'

@ApiTags('Guide Pages')
@Controller('guides/public')
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get()
  @ApiOperation({ summary: 'Get public guides' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Language code',
    required: true,
    enum: ['en-US', 'hi-IN', 'zh-CN', 'es-ES', 'fr-FR', 'ja-JP', 'it-IT', 'de-DE'],
  })
  async show(
    @Query() query: GuidesQueryDto,
    @AcceptLanguage() language: string,
  ): Promise<PaginateRO> {
    return this.guidesService.show(query, language)
  }

  @Get(':guideId/article/:articleId')
  @ApiOperation({ summary: 'Get public guide article details' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiHeader({
    name: 'Accept-Language',
    description: 'Language code',
    required: true,
    enum: ['en-US', 'hi-IN', 'zh-CN', 'es-ES', 'fr-FR', 'ja-JP', 'it-IT', 'de-DE'],
  })
  async showArticle(
    @Param('guideId') guideId: string,
    @Param('articleId') articleId: string,
    @AcceptLanguage()
    language: string,
  ): Promise<SuccessRO> {
    return this.guidesService.showArticle(guideId, articleId, language)
  }
}
