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
import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { HomepagesService } from './homepages.service'
import { QueryDto } from './dto'

@ApiTags('Homepages')
@Controller('homepages')
export class HomepagesController {
  constructor(private readonly homepagesService: HomepagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get homepage sections created by admin' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(null, new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.homepagesService.show(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get homepage section by id' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(
    @Param('id') id: string,
    @Query(null, new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.homepagesService.showOne(id, query)
  }
}
