import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { GetResponse } from '@app/src/shared/swagger/responses'
import { SubgraphGuard } from '@app/src/shared/auth/guards/subgraph.guard'
import { NonprofitFundsDto } from './dto'
import { NonprofitFundsService } from './nonprofit-funds.service'

@ApiTags('Nonprofit Funds')
@Controller('nonprofit/funds')
export class NonprofitFundsController {
  constructor(protected readonly nonprofitFundsService: NonprofitFundsService) {}

  @UseGuards(SubgraphGuard)
  @Post('received')
  @ApiOperation({ summary: 'Funds received by the Donation Project' })
  @ApiOkResponse({ type: SuccessRO })
  @ApiNotFoundResponse(GetResponse(ErrorKey.DONATION_PROJECT_NOT_FOUND))
  async fundsReceived(@Body() payload: NonprofitFundsDto): Promise<SuccessRO> {
    return await this.nonprofitFundsService.fundsReceived(payload)
  }

  @UseGuards(SubgraphGuard)
  @Post('withdrawn')
  @ApiOperation({ summary: 'Funds withdrawn by the Nonprofit' })
  @ApiOkResponse({ type: SuccessRO })
  async fundsWithdrawn(@Body() payload: NonprofitFundsDto): Promise<SuccessRO> {
    return await this.nonprofitFundsService.fundsWithdrawn(payload)
  }

  @UseGuards(SubgraphGuard)
  @Post('settled')
  @ApiOperation({ summary: 'Funds settled for the Nonprofit' })
  @ApiOkResponse({ type: SuccessRO })
  async fundsSettled(@Body() payload: NonprofitFundsDto): Promise<SuccessRO> {
    return await this.nonprofitFundsService.fundsSettled(payload)
  }
}
