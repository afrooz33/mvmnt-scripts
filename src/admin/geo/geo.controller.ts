import { Get, Query, Controller, ValidationPipe, Param } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  ForbiddenResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} from '@app/src/shared/swagger/responses'
import { PaginateRO } from '@app/src/shared/dto'
import { MyPaginateDto } from '@app/src/shared/base'
import { GeoService } from './geo.service'
import { GetCountryDto } from './dto'

@ApiTags('Admin Geo')
@Controller('admin/geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('continents')
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get all continents' })
  async show(@Query(new ValidationPipe()) query: MyPaginateDto): Promise<PaginateRO> {
    return this.geoService.show(query)
  }

  @Get('countries')
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get all countries' })
  async showCountries(@Query(new ValidationPipe()) query: GetCountryDto): Promise<PaginateRO> {
    return this.geoService.showCountries(query)
  }

  @Get(':countryId/provinces')
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get all province by country' })
  async showProvinces(
    @Query(new ValidationPipe()) query: MyPaginateDto,
    @Param('countryId') countryId: string,
  ): Promise<PaginateRO> {
    return this.geoService.showProvinces(query, countryId)
  }
}
