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
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { NonprofitUserService } from './nonprofit-user.service'
import { QueryDto } from './dto'

@ApiTags('User Nonprofit APi')
@Controller('public/nonprofit')
export class NonprofitUserController {
  constructor(private readonly nonprofitService: NonprofitUserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all nonprofit users' })
  @ApiOkResponse({ type: PaginateRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async show(@Query(null, new ValidationPipe()) query: QueryDto): Promise<PaginateRO> {
    return this.nonprofitService.show(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get nonprofit user by id' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  @ApiForbiddenResponse(ForbiddenResponse)
  async showOne(@Param('id') id: string): Promise<any> {
    return this.nonprofitService.showOne(id)
  }
}
