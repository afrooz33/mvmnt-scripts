import { Injectable, Logger } from '@nestjs/common'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { GovernanceService } from '@app/src/blockchain/services/governance.service'
import {
  TransactionResponse,
  ProposalResponse,
  ProposalListResponse,
  VoteResponse,
  VoteListResponse,
} from '@app/src/blockchain/interfaces/governance.interface'
import { CreateProposalDto, VoteDto } from '@app/src/blockchain/dto/responses.dto'

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name)

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly governanceService: GovernanceService,
  ) {}

  async createProposal(createProposalDto: CreateProposalDto): Promise<TransactionResponse> {
    try {
      this.logger.log(`Creating proposal for brand ${createProposalDto.brandId}`)

      const result = await this.governanceService.createProposal({
        brandId: createProposalDto.brandId,
        tokenAmount: createProposalDto.tokenAmount,
        description: createProposalDto.description,
        userWalletAddress: createProposalDto.userWalletAddress,
      })

      return result
    } catch (error) {
      this.logger.error(`Error creating proposal: ${error.message}`)
      throw error
    }
  }

  async cancelProposal(params: {
    proposalId: number
    userWalletAddress?: string
  }): Promise<TransactionResponse> {
    try {
      this.logger.log(`Cancelling proposal ${params.proposalId}`)

      const result = await this.governanceService.cancelProposal({
        proposalId: params.proposalId,
        userWalletAddress: params.userWalletAddress,
      })

      return result
    } catch (error) {
      this.logger.error(`Error cancelling proposal: ${error.message}`)
      throw error
    }
  }

  async executeProposal(params: {
    proposalId: number
    userWalletAddress?: string
  }): Promise<TransactionResponse> {
    try {
      this.logger.log(`Executing proposal ${params.proposalId}`)

      const result = await this.governanceService.executeProposal({
        proposalId: params.proposalId,
        userWalletAddress: params.userWalletAddress,
      })

      return result
    } catch (error) {
      this.logger.error(`Error executing proposal: ${error.message}`)
      throw error
    }
  }

  async finalizeProposal(params: {
    proposalId: number
    userWalletAddress?: string
  }): Promise<TransactionResponse> {
    try {
      this.logger.log(`Finalizing proposal ${params.proposalId}`)

      const result = await this.governanceService.finalizeProposal({
        proposalId: params.proposalId,
        userWalletAddress: params.userWalletAddress,
      })

      return result
    } catch (error) {
      this.logger.error(`Error finalizing proposal: ${error.message}`)
      throw error
    }
  }

  async getProposalDetails(proposalId: number): Promise<ProposalResponse> {
    try {
      this.logger.log(`Getting proposal details for ${proposalId}`)

      const result = await this.governanceService.getProposalDetails(proposalId)

      return result
    } catch (error) {
      this.logger.error(`Error getting proposal details: ${error.message}`)
      throw error
    }
  }

  async getBrandProposals(
    brandId: string,
    page: number,
    limit: number,
  ): Promise<ProposalListResponse> {
    try {
      this.logger.log(`Getting proposals for brand ${brandId}, page ${page}, limit ${limit}`)

      const result = await this.governanceService.getBrandProposals(brandId, page, limit)

      return result
    } catch (error) {
      this.logger.error(`Error getting brand proposals: ${error.message}`)
      throw error
    }
  }

  async getActiveProposal(brandId: string): Promise<ProposalResponse | null> {
    try {
      this.logger.log(`Getting active proposal for brand ${brandId}`)

      // Note: The governance service expects BigNumberish, but we'll pass the string
      // and let the service handle the conversion internally
      const result = await this.governanceService.getActiveProposal(brandId as any)

      return result
    } catch (error) {
      this.logger.error(`Error getting active proposal: ${error.message}`)
      throw error
    }
  }

  async castVote(params: {
    proposalId: number
    support: boolean
    userWalletAddress?: string
  }): Promise<TransactionResponse> {
    try {
      this.logger.log(`Casting vote on proposal ${params.proposalId}, support: ${params.support}`)

      const result = await this.governanceService.castVote({
        proposalId: params.proposalId,
        support: params.support,
        userWalletAddress: params.userWalletAddress,
      })

      return result
    } catch (error) {
      this.logger.error(`Error casting vote: ${error.message}`)
      throw error
    }
  }

  async getProposalVotes(params: {
    proposalId: number
    page: number
    limit: number
  }): Promise<VoteListResponse> {
    try {
      this.logger.log(
        `Getting votes for proposal ${params.proposalId}, page ${params.page}, limit ${params.limit}`,
      )

      const result = await this.governanceService.getProposalVotes({
        proposalId: params.proposalId,
        page: params.page,
        limit: params.limit,
      })

      return result
    } catch (error) {
      this.logger.error(`Error getting proposal votes: ${error.message}`)
      throw error
    }
  }

  async getVoteDetails(params: { proposalId: number; voter: string }): Promise<VoteResponse> {
    try {
      this.logger.log(
        `Getting vote details for proposal ${params.proposalId}, voter ${params.voter}`,
      )

      const result = await this.governanceService.getVoteDetails({
        proposalId: params.proposalId,
        voter: params.voter,
      })

      return result
    } catch (error) {
      this.logger.error(`Error getting vote details: ${error.message}`)
      throw error
    }
  }
}
