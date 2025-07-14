import { Get, Query, Controller, ValidationPipe } from '@nestjs/common'
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
import { GeoService } from '@app/src/admin/geo/geo.service'
import { GetCountryDto, GetPostcodeDto } from '@app/src/admin/geo/dto'

@ApiTags('Geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('public/countries')
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get all countries' })
  async showCountries(@Query(new ValidationPipe()) query: GetCountryDto): Promise<PaginateRO> {
    return this.geoService.showCountries(query)
  }

  @Get('public/postal-codes')
  @ApiOkResponse({ type: PaginateRO })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiOperation({ summary: 'Get all postal codes' })
  async showPostalCodes(@Query(new ValidationPipe()) query: GetPostcodeDto): Promise<PaginateRO> {
    return this.geoService.showPostalCodes(query)
  }
}
