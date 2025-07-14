import { Controller, Get, Query } from '@nestjs/common'
import { QueryDto } from '@app/src/admin/languages/dto'
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import {
  BadRequestResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
} from '@app/src/shared/swagger/responses'
import { LanguagesService } from '@app/src/admin/languages/languages.service'
import { ValidationPipe } from '@app/src/shared/validations'
import { FilterDeleted } from '@app/src/shared/decorators'

@ApiTags('Languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get All Langauge' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.languagesService.show(query)
  }
}
