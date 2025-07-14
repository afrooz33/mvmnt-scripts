import { Injectable, Logger } from '@nestjs/common'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { GovernanceService } from '@app/src/blockchain/services/governance.service'
import {
  TransactionResponse,
  DistributionHistoryResponse,
  DistributionRecipientsResponse,
  DistributionCampaignResponse,
  CampaignStatisticsResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import {
  ManualDistributionDto,
  CSVUploadDto,
  CSVDistributionDto,
  CreateCampaignDto,
  CloseCampaignDto,
  UpdateCampaignDto,
  DeleteCampaignDto,
} from '@app/src/blockchain/dto/responses.dto'

@Injectable()
export class DistributionService {
  private readonly logger = new Logger(DistributionService.name)

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly governanceService: GovernanceService,
  ) {}

  // Commented out by request: distributeTokensManually
  // async distributeTokensManually(
  //   manualDistributionDto: ManualDistributionDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Distributing tokens manually for brand ${manualDistributionDto.brandId}`)

  //     const result = await this.governanceService.distributeTokensManually({
  //       brandId: manualDistributionDto.brandId,
  //       recipients: manualDistributionDto.recipients,
  //       amounts: manualDistributionDto.amounts,
  //       userWalletAddress: manualDistributionDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error distributing tokens manually: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: uploadDistributionCSV
  // async uploadDistributionCSV(csvUploadDto: CSVUploadDto): Promise<{
  //   success: boolean
  //   validRecords: number
  //   invalidRecords: number
  //   previewData: any[]
  // }> {
  //   try {
  //     this.logger.log(`Uploading CSV for brand ${csvUploadDto.brandId}`)

  //     const result = await this.governanceService.processCSVDistribution({
  //       brandId: csvUploadDto.brandId,
  //       csvData: csvUploadDto.csvData,
  //       validateOnly: true,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error uploading CSV: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: executeCSVDistribution
  // async executeCSVDistribution(
  //   csvDistributionDto: CSVDistributionDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Executing CSV distribution for brand ${csvDistributionDto.brandId}`)

  //     const result = await this.governanceService.executeCSVDistribution({
  //       brandId: csvDistributionDto.brandId,
  //       distributionData: csvDistributionDto.distributionData,
  //       userWalletAddress: csvDistributionDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error executing CSV distribution: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getDistributionHistory
  // async getDistributionHistory(
  //   brandId: string,
  //   page: number,
  //   limit: number,
  // ): Promise<DistributionHistoryResponse> {
  //   try {
  //     this.logger.log(
  //       `Getting distribution history for brand ${brandId}, page ${page}, limit ${limit}`,
  //     )

  //     const result = await this.governanceService.getDistributionHistory({
  //       brandId,
  //       page,
  //       limit,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting distribution history: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getDistributionRecipients
  // async getDistributionRecipients(
  //   distributionId: string,
  //   page: number,
  //   limit: number,
  // ): Promise<DistributionRecipientsResponse> {
  //   try {
  //     this.logger.log(
  //       `Getting recipients for distribution ${distributionId}, page ${page}, limit ${limit}`,
  //     )

  //     const result = await this.governanceService.getDistributionRecipients({
  //       distributionId: parseInt(distributionId),
  //       page,
  //       limit,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting distribution recipients: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: createDistributionCampaign
  // async createDistributionCampaign(campaignDto: CreateCampaignDto): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Creating distribution campaign for brand ${campaignDto.brandId}`)

  //     const result = await this.governanceService.createDistributionCampaign({
  //       brandId: campaignDto.brandId,
  //       name: campaignDto.name,
  //       description: campaignDto.description,
  //       startTime: campaignDto.startTime,
  //       endTime: campaignDto.endTime,
  //       totalTokens: campaignDto.totalTokens,
  //       userWalletAddress: campaignDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error creating distribution campaign: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getDistributionCampaigns
  // async getDistributionCampaigns(brandId: string): Promise<DistributionCampaignResponse[]> {
  //   try {
  //     this.logger.log(`Getting distribution campaigns for brand ${brandId}`)

  //     const result = await this.governanceService.getDistributionCampaigns({
  //       brandId,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting distribution campaigns: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getCampaignById
  // async getCampaignById(campaignId: string): Promise<DistributionCampaignResponse> {
  //   try {
  //     this.logger.log(`Getting campaign by ID ${campaignId}`)

  //     const result = await this.governanceService.getCampaignById({
  //       campaignId: parseInt(campaignId),
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting campaign by ID: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: closeCampaign
  // async closeCampaign(
  //   campaignId: string,
  //   closeDto: CloseCampaignDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Closing campaign ${campaignId}`)

  //     const result = await this.governanceService.closeCampaign({
  //       campaignId: parseInt(campaignId),
  //       reason: closeDto.reason,
  //       userWalletAddress: closeDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error closing campaign: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: updateCampaign
  // async updateCampaign(
  //   campaignId: string,
  //   updateDto: UpdateCampaignDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Updating campaign ${campaignId}`)

  //     const result = await this.governanceService.updateCampaign({
  //       campaignId: parseInt(campaignId),
  //       name: updateDto.name,
  //       description: updateDto.description,
  //       startTime: updateDto.startTime,
  //       endTime: updateDto.endTime,
  //       totalTokens: updateDto.totalTokens,
  //       userWalletAddress: updateDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error updating campaign: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: deleteCampaign
  // async deleteCampaign(
  //   campaignId: string,
  //   deleteDto: DeleteCampaignDto,
  // ): Promise<TransactionResponse> {
  //   try {
  //     this.logger.log(`Deleting campaign ${campaignId}`)

  //     const result = await this.governanceService.deleteCampaign({
  //       campaignId: parseInt(campaignId),
  //       reason: deleteDto.reason,
  //       forceDelete: deleteDto.forceDelete,
  //       userWalletAddress: deleteDto.userWalletAddress,
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error deleting campaign: ${error.message}`)
  //     throw error
  //   }
  // }

  // Commented out by request: getCampaignStatistics
  // async getCampaignStatistics(campaignId: string): Promise<CampaignStatisticsResponse> {
  //   try {
  //     this.logger.log(`Getting campaign statistics for ${campaignId}`)

  //     const result = await this.governanceService.getCampaignStatistics({
  //       campaignId: parseInt(campaignId),
  //     })

  //     return result
  //   } catch (error) {
  //     this.logger.error(`Error getting campaign statistics: ${error.message}`)
  //     throw error
  //   }
  // }
}
