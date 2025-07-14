import { Injectable, Logger } from '@nestjs/common'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { GovernanceService } from '@app/src/blockchain/services/governance.service'
import {
  TransactionResponse,
  RewardConditionResponse,
  ConditionValidationResponse,
  AutomaticRewardResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import {
  CreateConditionDto,
  EditConditionDto,
  ConditionScheduleDto,
  ValidateConditionDto,
  ProcessAutomaticDto,
} from '@app/src/blockchain/dto/responses.dto'

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name)

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly governanceService: GovernanceService,
  ) {}

  // Commented out by request: createRewardCondition
  // async createRewardCondition(conditionDto: CreateConditionDto): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Creating reward condition for brand ${conditionDto.brandId}`)

  //     const result = await this.governanceService.createRewardCondition({
  //       brandId: conditionDto.brandId,
  //       conditionType: conditionDto.conditionType,
  //       requiredAmount: conditionDto.requiredAmount,
  //       duration: conditionDto.duration,
  //       rewardAmount: conditionDto.rewardAmount,
  //       description: conditionDto.description,
  //       userWalletAddress: conditionDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error creating reward condition: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: editRewardCondition
  // async editRewardCondition(
  //   conditionId: string,
  //   editConditionDto: EditConditionDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Editing reward condition ${conditionId}`)

  //     const result = await this.governanceService.editRewardCondition({
  //       conditionId: parseInt(conditionId),
  //       requiredAmount: editConditionDto.requiredAmount,
  //       duration: editConditionDto.duration,
  //       rewardAmount: editConditionDto.rewardAmount,
  //       description: editConditionDto.description,
  //       userWalletAddress: editConditionDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error editing reward condition: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: setConditionSchedule
  // async setConditionSchedule(
  //   conditionId: string,
  //   scheduleDto: ConditionScheduleDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Setting schedule for condition ${conditionId}`)

  //     const result = await this.governanceService.setConditionSchedule({
  //       conditionId: parseInt(conditionId),
  //       startTime: scheduleDto.startTime,
  //       endTime: scheduleDto.endTime,
  //       isActive: scheduleDto.isActive,
  //       userWalletAddress: scheduleDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error setting condition schedule: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getRewardConditions
  // async getRewardConditions(brandId: string): Promise<RewardConditionResponse[]> {
  //   try {
  //     this.logger.log(`Getting reward conditions for brand ${brandId}`)

  //     const result = await this.governanceService.getRewardConditions({
  //       brandId,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting reward conditions: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: validateCondition
  // async validateCondition(
  //   conditionId: string,
  //   validateDto: ValidateConditionDto,
  // ): Promise<ConditionValidationResponse> {
  //   try {
  //     this.logger.log(`Validating condition ${conditionId} for user ${validateDto.userAddress}`)

  //     const result = await this.governanceService.validateCondition({
  //       conditionId: parseInt(conditionId),
  //       userAddress: validateDto.userAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error validating condition: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: processAutomaticRewards
  // async processAutomaticRewards(processDto: ProcessAutomaticDto): Promise<AutomaticRewardResponse> {
  //   try {
  //     this.logger.log(`Processing automatic rewards for brand ${processDto.brandId}`)

  //     const result = await this.governanceService.processAutomaticRewards({
  //       brandId: processDto.brandId,
  //       userWalletAddress: processDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error processing automatic rewards: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getAvailableTokensForRewards
  // async getAvailableTokensForRewards(
  //   brandId: string,
  // ): Promise<{ availableTokens: string; totalAllocated: string }> {
  //   try {
  //     this.logger.log(`Getting available tokens for rewards for brand ${brandId}`)

  //     const result = await this.governanceService.getAvailableTokensForRewards({
  //       brandId,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting available tokens: ${error.message}`)
  //     throw error
  //   }
  // }
}
