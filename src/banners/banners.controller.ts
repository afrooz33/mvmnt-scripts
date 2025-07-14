import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Controller, Get, Query, ValidationPipe } from '@nestjs/common'
import { PaginateRO } from '@app/src/shared/dto'
import { FilterDeleted } from '@app/src/shared/decorators'
import { BadRequestResponse } from '@app/src/shared/swagger/responses'
import { BannersService } from './banners.service'
import { QueryDto } from './dto'

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get banners for homepage without login' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  async show(
    @Query(new FilterDeleted(), new ValidationPipe()) query: QueryDto,
  ): Promise<PaginateRO> {
    return this.bannersService.show(query)
  }
}
