import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Controller, Post, Param, UseGuards } from '@nestjs/common'
import { UserTypes } from '@app/src/shared/enums/user-type.enum'
import { RolesGuard } from '@app/src/shared/auth/guards/roles.guard'
import { UnauthorizedResponse } from '@app/src/shared/swagger/responses'
import { JwtAuthGuard } from '@app/src/shared/auth/guards/jwt-auth.guard'
import { UserType } from '@app/src/shared/auth/decorators/user-type.decorator'
import { BadRequestResponse, ForbiddenResponse } from '@app/src/shared/swagger/responses'
import { TransactionProcessorService } from './transaction-processor.service'
import { TransactionProcessorRepository } from './repository'
import { SubgraphEvents } from './enums'

@ApiTags('Transaction Processor')
@Controller('transaction-processor')
export class TransactionProcessorController {
  constructor(
    private readonly transactionService: TransactionProcessorService,
    private readonly transactionRepository: TransactionProcessorRepository,
  ) {}

  @Post('process/:hash')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserType(
    UserTypes.BUSINESS_COMPANY,
    UserTypes.INDIVIDUAL_PERSONAL,
    UserTypes.INDIVIDUAL_INFLUENCER,
    UserTypes.BUSINESS_SOLE_PROPRIETOR,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually process a transaction' })
  @ApiForbiddenResponse(ForbiddenResponse)
  @ApiBadRequestResponse(BadRequestResponse)
  @ApiUnauthorizedResponse(UnauthorizedResponse)
  async processTransaction(@Param('hash') transactionHash: string) {
    const result = await this.transactionService.manuallyProcessTransactionByEvent(
      transactionHash,
      SubgraphEvents.dealPayment,
    )
    return { success: result, message: 'Transaction queued for processing' }
  }
}
