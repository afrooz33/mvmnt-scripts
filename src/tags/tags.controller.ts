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
  ForbiddenResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { Controller, Get, Query, ValidationPipe } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { FilterDeleted } from '@app/src/shared/decorators'
import { TagsService } from './tags.service'
import { QueryDto } from './dto'

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.tagsService.show(query)
  }
}
