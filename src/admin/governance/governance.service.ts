import { Injectable, Logger } from '@nestjs/common'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { GovernanceService as BlockchainGovernanceService } from '@app/src/blockchain/services/governance.service'
import {
  TransactionResponse,
  GovernanceParamsResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import { GovernanceParamsDto, UpdateBTManagerDto } from '@app/src/blockchain/dto/responses.dto'

@Injectable()
export class GovernanceService {
  private readonly logger = new Logger(GovernanceService.name)

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly blockchainGovernanceService: BlockchainGovernanceService,
  ) {}

  async setGovernanceParams(
    brandId: string,
    payload: GovernanceParamsDto,
  ): Promise<TransactionResponse> {
    try {
      this.logger.log(`Setting governance parameters for brand ${brandId}`)

      const result = await this.blockchainGovernanceService.setGovernanceParams({
        brandId,
        votingDuration: payload.votingDuration,
        quorumPercentage: payload.quorumPercentage,
        approvalPercentage: payload.approvalPercentage,
        userWalletAddress: payload.userWalletAddress,
      })

      return result
    } catch (error) {
      this.logger.error(`Error setting governance parameters: ${error.message}`)
      throw error
    }
  }

  async getGovernanceParams(brandId: string): Promise<GovernanceParamsResponse> {
    try {
      this.logger.log(`Getting governance parameters for brand ${brandId}`)

      const result = await this.blockchainGovernanceService.getGovernanceParams(brandId)

      return result
    } catch (error) {
      this.logger.error(`Error getting governance parameters: ${error.message}`)
      throw error
    }
  }

  async pause(userWalletAddress?: string): Promise<TransactionResponse> {
    try {
      this.logger.log('Pausing governance operations')

      const result = await this.blockchainGovernanceService.pause(userWalletAddress)

      return result
    } catch (error) {
      this.logger.error(`Error pausing governance: ${error.message}`)
      throw error
    }
  }

  async unpause(userWalletAddress?: string): Promise<TransactionResponse> {
    try {
      this.logger.log('Unpausing governance operations')

      const result = await this.blockchainGovernanceService.unpause(userWalletAddress)

      return result
    } catch (error) {
      this.logger.error(`Error unpausing governance: ${error.message}`)
      throw error
    }
  }

  async isPaused(): Promise<{ isPaused: boolean }> {
    try {
      this.logger.log('Checking if governance is paused')

      const result = await this.blockchainGovernanceService.isPaused()

      return { isPaused: result }
    } catch (error) {
      this.logger.error(`Error checking pause status: ${error.message}`)
      throw error
    }
  }

  async updateBTManager(updateBTManagerDto: UpdateBTManagerDto): Promise<TransactionResponse> {
    try {
      this.logger.log('Updating Brand Token Manager address')

      const result = await this.blockchainGovernanceService.updateBTManager({
        btManager: updateBTManagerDto.btManager,
        userWalletAddress: updateBTManagerDto.userWalletAddress,
      })

      return result
    } catch (error) {
      this.logger.error(`Error updating Brand Token Manager: ${error.message}`)
      throw error
    }
  }
}
