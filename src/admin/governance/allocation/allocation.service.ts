import { Injectable, Logger } from '@nestjs/common'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { GovernanceService } from '@app/src/blockchain/services/governance.service'
import {
  TransactionResponse,
  TokenAllocationSummaryResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import { TokenAllocationDto } from '@app/src/blockchain/dto/responses.dto'

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name)

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly governanceService: GovernanceService,
  ) {}

  // Commented out by request: allocateTokens
  // async allocateTokens(allocationDto: TokenAllocationDto): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Allocating tokens for purpose: ${allocationDto.purpose}`)

  //     // This method doesn't have a direct equivalent in the governance service
  //     // We'll use allocateTokensForRewards as a fallback
  //     const result = await this.governanceService.allocateTokensForRewards({
  //       brandId: allocationDto.brandId,
  //       amount: allocationDto.amount,
  //       source: allocationDto.purpose,
  //       userWalletAddress: allocationDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error allocating tokens: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: allocateTokensForRewards
  // async allocateTokensForRewards(
  //   brandId: string,
  //   allocationDto: TokenAllocationDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Allocating tokens for rewards for brand ${brandId}`)

  //     const result = await this.governanceService.allocateTokensForRewards({
  //       brandId,
  //       amount: allocationDto.amount,
  //       source: allocationDto.purpose || 'rewards',
  //       userWalletAddress: allocationDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error allocating tokens for rewards: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getTokenAllocationSummary
  // async getTokenAllocationSummary(brandId: string): Promise<TokenAllocationSummaryResponse> {
  //   try {
  //     this.logger.log(`Getting token allocation summary for brand ${brandId}`)

  //     const result = await this.governanceService.getTokenAllocationSummary({
  //       brandId,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting token allocation summary: ${error.message}`)
  //     throw error
  //   }
  // }
}
