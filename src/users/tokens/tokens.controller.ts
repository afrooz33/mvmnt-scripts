import { Get, Controller, Query } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger'
import { PaginateRO } from '@app/src/shared/dto'
import { GetResponse, BadRequestResponse } from '@app/src/shared/swagger/responses'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { QueryDto } from './dto'

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiOkResponse({ type: PaginateRO })
  @ApiOperation({ summary: 'User get all whitelisted tokens' })
  @ApiNotFoundResponse(GetResponse('Token does not exist'))
  async showOne(@Query() query: QueryDto): Promise<PaginateRO> {
    query.is_whitelisted = 'Yes'

    return this.tokensService.show(query)
  }
}
