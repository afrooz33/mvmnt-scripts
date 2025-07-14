import { Injectable, Logger, OnModuleDestroy, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { GovernanceManagerAbi } from '../abi/GovernanceManager.abi'
import { ErrorKey } from '@app/src/shared/enums'

// Constants
const MAX_RETRIES = 3
const BLOCKS_TO_WAIT = 1

const GAS_PRICE_MULTIPLIER = 1.1 // 10% increase for faster confirmation
const POLLING_INTERVAL = 12000 // 12 seconds

@Injectable()
export class GovernanceService implements OnModuleDestroy {
  private readonly logger = new Logger(GovernanceService.name)
  private contract: ethers.Contract
  private provider: ethers.JsonRpcProvider
  private lastProcessedBlock: number = 0
  private pollingInterval: NodeJS.Timeout | null = null

  constructor(private readonly configService: ConfigService) {
    this.initializeContract()
  }

  async onModuleDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private async initializeContract() {
    try {
      const rpcUrl =
        this.configService.get<string>('blockchain.provider.rpcURL') ||
        this.configService.get<string>('BLOCKCHAIN_PROVIDER_RPCURL') ||
        this.configService.get<string>('ETH_RPC_URL')

      this.logger.log(`Attempting to initialize with RPC URL: ${rpcUrl}`)

      // Initialize provider with specific network configuration
      this.provider = new ethers.JsonRpcProvider(rpcUrl, {
        chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '84532'),
        name: 'base-sepolia',
      })

      // Add retry mechanism for provider initialization
      let retryCount = 0
      while (retryCount < MAX_RETRIES) {
        try {
          // Test provider connection
          await this.provider.getNetwork()
          break
        } catch (error) {
          retryCount++
          if (retryCount === MAX_RETRIES) {
            throw new Error(
              `Failed to connect to provider after ${MAX_RETRIES} attempts: ${error.message}`,
            )
          }
          this.logger.warn(`Provider connection attempt ${retryCount} failed: ${error.message}`)
          await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds before retry
        }
      }

      const contractAddress =
        this.configService.get<string>('blockchain.contract.governanceManager.address') ||
        this.configService.get<string>('GOVERNANCE_MANAGER')

      if (!contractAddress) {
        throw new Error('Governance contract address not found in configuration')
      }

      this.logger.log(`Initializing governance contract at address: ${contractAddress}`)

      this.contract = new ethers.Contract(contractAddress, GovernanceManagerAbi, this.provider)

      this.logger.log('Governance contract initialized successfully')

      // Start polling for events
      await this.startEventPolling()
    } catch (error) {
      this.logger.error(`Error initializing contract: ${error.message}`)
      throw new Error(`Failed to initialize contract: ${error.message}`)
    }
  }

  private async startEventPolling() {
    try {
      // Get the current block number as starting point
      this.lastProcessedBlock = await this.provider.getBlockNumber()
      this.logger.log(`Starting event polling from block ${this.lastProcessedBlock}`)

      // Set up polling interval
      this.pollingInterval = setInterval(async () => {
        try {
          await this.pollEvents()
        } catch (error) {
          this.logger.error(`Error polling events: ${error.message}`)
        }
      }, POLLING_INTERVAL)
    } catch (error) {
      this.logger.error(`Error starting event polling: ${error.message}`)
    }
  }

  private async pollEvents() {
    try {
      const currentBlock = await this.provider.getBlockNumber()

      // Only process if new blocks are available
      if (currentBlock <= this.lastProcessedBlock) {
        return
      }

      // Add retry mechanism with exponential backoff
      let retryCount = 0
      const maxRetries = 3
      const baseDelay = 2000 // 2 seconds

      while (retryCount < maxRetries) {
        try {
          // Get events from the last processed block to current
          const events = await this.contract.queryFilter(
            '*' as any,
            this.lastProcessedBlock + 1,
            currentBlock,
          )

          // Process each event
          for (const event of events) {
            try {
              // Cast event to include eventName and args
              const typedEvent = event as unknown as {
                eventName: string
                args: {
                  proposalId?: string | number
                  brandId?: string | number
                  creator?: string
                  tokenAmount?: string | number
                  voter?: string
                  support?: boolean
                  voteWeight?: string | number
                  status?: string | number
                  votingDuration?: string | number
                  quorumPercentage?: string | number
                  approvalPercentage?: string | number
                }
              }

              switch (typedEvent.eventName) {
                case 'ProposalCreated':
                  const { proposalId, brandId, creator, tokenAmount } = typedEvent.args || {}
                  this.logger.log(
                    `New proposal created - ID: ${proposalId}, Brand: ${brandId}, ` +
                      `Creator: ${creator}, Amount: ${tokenAmount}`,
                  )
                  break

                case 'VoteCast':
                  const {
                    proposalId: voteProposalId,
                    voter,
                    support,
                    voteWeight,
                  } = typedEvent.args || {}
                  this.logger.log(
                    `Vote cast - Proposal: ${voteProposalId}, Voter: ${voter}, ` +
                      `Support: ${support}, Weight: ${voteWeight}`,
                  )
                  break

                case 'ProposalStatusChanged':
                  const { proposalId: statusProposalId, status } = typedEvent.args || {}
                  this.logger.log(
                    `Proposal status changed - ID: ${statusProposalId}, Status: ${status}`,
                  )
                  break

                case 'ProposalExecuted':
                  const {
                    proposalId: executedProposalId,
                    brandId: executedBrandId,
                    tokenAmount: executedAmount,
                  } = typedEvent.args || {}
                  this.logger.log(
                    `Proposal executed - ID: ${executedProposalId}, Brand: ${executedBrandId}, ` +
                      `Amount: ${executedAmount}`,
                  )
                  break

                case 'GovernanceParamsSet':
                  const {
                    brandId: paramsBrandId,
                    votingDuration,
                    quorumPercentage,
                    approvalPercentage,
                  } = typedEvent.args || {}
                  this.logger.log(
                    `Governance params set - Brand: ${paramsBrandId}, ` +
                      `Duration: ${votingDuration}, ` +
                      `Quorum: ${quorumPercentage}%, ` +
                      `Approval: ${approvalPercentage}%`,
                  )
                  break
              }
            } catch (eventError) {
              this.logger.error(`Error processing event: ${eventError.message}`)
              // Continue processing other events even if one fails
              continue
            }
          }

          // Update last processed block only if successful
          this.lastProcessedBlock = currentBlock
          break // Exit retry loop on success
        } catch (error) {
          retryCount++
          if (retryCount === maxRetries) {
            this.logger.error(
              `Failed to poll events after ${maxRetries} attempts: ${error.message}`,
            )
            throw error
          }
          const delay = baseDelay * Math.pow(2, retryCount - 1)
          this.logger.warn(
            `Retrying event poll in ${delay}ms (attempt ${retryCount}/${maxRetries})`,
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    } catch (error) {
      this.logger.error(`Error in event polling: ${error.message}`)
    }
  }

  private async getContractWithSigner(userWalletAddress?: string): Promise<ethers.Contract> {
    try {
      // Ensure contract is initialized
      if (!this.contract) {
        await this.initializeContract()
      }

      // Get private key using similar pattern as BrandManagerService
      const privateKey = userWalletAddress
        ? this.configService.get<string>('blockchain.contract.governance.userKey') ||
          this.configService.get<string>('ADMIN_KEY')
        : this.configService.get<string>('blockchain.contract.trustedEntity.key') ||
          this.configService.getOrThrow<string>('TRUSTED_ENTITY_KEY')

      // Create a wallet instance directly with the provider
      const wallet = new ethers.Wallet(privateKey, this.provider)
      this.logger.log(`Using signer address: ${wallet.address}`)

      // Get the contract address safely
      let contractAddress: string

      if (this.contract && this.contract.target) {
        contractAddress = this.contract.target as string
      } else {
        // Fallback to get address from config
        contractAddress =
          this.configService.get<string>('blockchain.contract.governanceManager.address') ||
          this.configService.get<string>('GOVERNANCE_MANAGER')

        if (!contractAddress) {
          throw new Error('Contract address not found in configuration')
        }
      }

      // Create and return a new contract instance with the wallet
      return new ethers.Contract(contractAddress, GovernanceManagerAbi, wallet)
    } catch (error) {
      this.logger.error(`Error creating contract signer: ${error.message}`)
      throw new Error(`Failed to create contract signer: ${error.message}`)
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES,
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation()
      } catch (error) {
        if (i === retries - 1) throw error
        this.logger.warn(`Retry ${i + 1}/${retries} after error: ${error.message}`)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
      }
    }
    throw new Error('Max retries exceeded')
  }

  private async getOptimizedGasPrice() {
    try {
      const feeData = await this.provider.getFeeData()
      if (!feeData || !feeData.gasPrice) {
        // Fallback to a default gas price if getFeeData fails
        return ethers.parseUnits('10', 'gwei')
      }
      return BigInt(Math.floor(Number(feeData.gasPrice) * GAS_PRICE_MULTIPLIER))
    } catch (error) {
      this.logger.warn(`Error getting gas price: ${error.message}. Using default.`)
      return ethers.parseUnits('10', 'gwei')
    }
  }

  // Helper method to convert UUID to BigNumber for smart contract
  private uuidToBigNumber(uuid: string): ethers.BigNumberish {
    // Remove hyphens and convert to hex
    const hexString = '0x' + uuid.replace(/-/g, '')
    // Convert to BigNumber
    return ethers.getBigInt(hexString)
  }

  async createProposal(createProposalDto: {
    brandId: string
    tokenAmount: number
    description: string
    userWalletAddress?: string
  }): Promise<any> {
    const { brandId, tokenAmount, description, userWalletAddress } = createProposalDto
    try {
      this.logger.log(
        `Creating proposal for brand ${brandId}: tokenAmount=${tokenAmount}, description="${description}"`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Validate brandId is valid
      if (!brandId || brandId.trim() === '') {
        return {
          hash: null,
          success: false,
          error: 'Brand ID is required',
        }
      }

      if (tokenAmount <= 0) {
        return {
          hash: null,
          success: false,
          error: 'Token amount must be greater than 0',
        }
      }

      if (tokenAmount > Number.MAX_SAFE_INTEGER) {
        throw new BadRequestException(ErrorKey.INVALID_TOKEN_AMOUNT)
      }

      return await this.executeWithRetry(async () => {
        const contract = await this.getContractWithSigner(userWalletAddress)

        const tx = await contract.createProposal(brandIdBN, tokenAmount, description)

        const receipt = await tx.wait()

        // Parse the ProposalCreated event to get the proposal ID
        const proposalCreatedEvent = receipt.logs.find(
          (log) => (log as any).fragment?.name === 'ProposalCreated',
        ) as any

        const proposalId = proposalCreatedEvent?.args?.[0]?.toString()

        return {
          hash: tx.hash,
          success: true,
          proposalId: proposalId,
        }
      })
    } catch (error) {
      this.logger.error(`Error creating proposal: ${error.message}`)

      if (error.message.includes('execution reverted')) {
        // Check for active proposal
        const activeProposal = await this.getActiveProposal(this.uuidToBigNumber(brandId))
        if (activeProposal) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'An active proposal already exists for this brand',
          }
        }
      }

      return {
        hash: error.transaction?.hash,
        success: false,
        error:
          'Failed to create proposal. Please check if there is an active proposal for this brand.',
      }
    }
  }

  async cancelProposal(cancelDto: {
    proposalId: number
    userWalletAddress?: string
  }): Promise<any> {
    const { proposalId, userWalletAddress } = cancelDto
    try {
      this.logger.log(`Cancelling proposal ${proposalId}`)

      const contract = await this.getContractWithSigner(userWalletAddress)
      const tx = await contract.cancelProposal(proposalId)
      const _receipt = await tx.wait()

      return {
        hash: tx.hash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Error cancelling proposal: ${error.message}`)
      return {
        hash: error.transaction?.hash,
        success: false,
        error: error.message,
      }
    }
  }

  async executeProposal(executeDto: {
    proposalId: number
    userWalletAddress?: string
  }): Promise<any> {
    const { proposalId, userWalletAddress } = executeDto
    try {
      const contract = await this.getContractWithSigner(userWalletAddress)
      const tx = await contract.executeProposal(proposalId)
      const _receipt = await tx.wait()
      return {
        hash: _receipt.hash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Error executing proposal: ${error.message}`)

      if (error.message.includes('execution reverted')) {
        // Check proposal status
        const proposal = await this.getProposalDetails(proposalId)

        if (proposal.status !== 2) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Proposal must be finalized before execution',
          }
        }

        // Check if proposal was approved
        const forVotes = Number(proposal.forVotes)
        const againstVotes = Number(proposal.againstVotes)
        const totalVotes = forVotes + againstVotes
        const approvalPercentage = (forVotes / totalVotes) * 100

        if (approvalPercentage < Number(proposal.minApprovalPercentage)) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Proposal did not meet the minimum approval percentage',
          }
        }
      }

      return {
        hash: error.transaction?.hash,
        success: false,
        error:
          'Failed to execute proposal. Please check proposal status and approval requirements.',
      }
    }
  }

  async finalizeProposal(finalizeDto: {
    proposalId: number
    userWalletAddress?: string
  }): Promise<any> {
    const { proposalId, userWalletAddress } = finalizeDto
    try {
      const contract = await this.getContractWithSigner(userWalletAddress)
      const tx = await contract.finalizeProposal(proposalId)
      const receipt = await tx.wait()
      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Error finalizing proposal: ${error.message}`)

      // Check for specific error conditions
      if (error.message.includes('execution reverted')) {
        // Check proposal status
        const proposal = await this.getProposalDetails(proposalId)

        if (proposal.status === 0) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Proposal does not exist',
          }
        }

        if (proposal.status === 2) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Proposal has already been finalized',
          }
        }

        if (proposal.status === 3) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Proposal has already been executed',
          }
        }

        if (proposal.status === 4) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Proposal has been cancelled',
          }
        }

        // Check if voting period has ended
        const currentTime = Math.floor(Date.now() / 1000)
        if (Number(proposal.endTime) > currentTime) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Voting period has not ended yet',
          }
        }
      }

      return {
        hash: error.transaction?.hash,
        success: false,
        error: 'Failed to finalize proposal. Please check proposal status and voting period.',
      }
    }
  }

  async getProposalDetails(proposalId: number): Promise<any> {
    try {
      const proposal = await this.contract.proposals(proposalId)
      return {
        id: proposalId.toString(),
        brandId: proposal.brandId.toString(),
        creator: proposal.creator,
        tokenAmount: proposal.tokenAmount.toString(),
        description: proposal.description,
        startTime: proposal.startTime.toString(),
        endTime: proposal.endTime.toString(),
        forVotes: proposal.forVotes.toString(),
        againstVotes: proposal.againstVotes.toString(),
        quorum: proposal.quorum.toString(),
        minApprovalPercentage: proposal.minApprovalPercentage.toString(),
        status: Number(proposal.status),
      }
    } catch (error) {
      this.logger.error(`Error getting proposal details: ${error.message}`)
      throw new BadRequestException(ErrorKey.PROPOSAL_FETCH_FAILED)
    }
  }

  async getBrandProposals(brandId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      const proposalIds = await this.contract.getBrandProposals(brandIdBN)
      const total = proposalIds.length

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedIds = proposalIds.slice(startIndex, endIndex)

      const proposals = await Promise.all(
        paginatedIds.map((id) => this.getProposalDetails(Number(id))),
      )

      return {
        proposals,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: endIndex < total,
        hasPrevPage: page > 1,
      }
    } catch (error) {
      this.logger.error(`Error getting brand proposals: ${error.message}`)
      throw new Error('Failed to fetch brand proposals')
    }
  }

  async getActiveProposal(brandId: ethers.BigNumberish): Promise<any> {
    try {
      const activeProposalId = await this.contract.getActiveProposal(brandId)
      if (Number(activeProposalId) === 0) {
        return null
      }
      return this.getProposalDetails(Number(activeProposalId))
    } catch (error) {
      this.logger.error(`Error getting active proposal: ${error.message}`)
      throw new BadRequestException(ErrorKey.PROPOSAL_FETCH_FAILED)
    }
  }

  async castVote(voteDto: {
    proposalId: number
    support: boolean
    userWalletAddress?: string
  }): Promise<any> {
    const { proposalId, support, userWalletAddress } = voteDto
    try {
      const contract = await this.getContractWithSigner(userWalletAddress)
      const tx = await contract.castVote(proposalId, support)
      const receipt = await tx.wait()
      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Error casting vote: ${error.message}`)

      if (error.message.includes('execution reverted')) {
        // Check proposal status
        const proposal = await this.getProposalDetails(proposalId)

        if (proposal.status !== 1) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'Cannot vote on a proposal that is not active',
          }
        }

        // Check if user has already voted
        const voteDetails = await this.getVoteDetails({ proposalId, voter: userWalletAddress })
        if (voteDetails.hasVoted) {
          return {
            hash: error.transaction?.hash,
            success: false,
            error: 'You have already voted on this proposal',
          }
        }
      }

      return {
        hash: error.transaction?.hash,
        success: false,
        error: 'Failed to cast vote. Please check proposal status and your voting eligibility.',
      }
    }
  }

  async getVoteDetails(voteDetailsDto: { proposalId: number; voter: string }): Promise<any> {
    const { proposalId, voter } = voteDetailsDto
    try {
      const vote = await this.contract.votes(proposalId, voter)
      return {
        hasVoted: vote.hasVoted,
        support: vote.support,
        voteWeight: vote.voteWeight.toString(),
      }
    } catch (error) {
      this.logger.error(`Error getting vote details: ${error.message}`)
      throw new Error('Failed to fetch vote details')
    }
  }

  async getProposalVotes(proposalVotesDto: {
    proposalId: number
    page?: number
    limit?: number
  }): Promise<any> {
    const { proposalId, page = 1, limit = 10 } = proposalVotesDto
    try {
      this.logger.log(`Getting votes for proposal ${proposalId}`)

      // Note: This is a limitation of the current contract design
      // The contract only provides a method to get a single vote for a specific voter
      // In a real implementation, you would need a method like getProposalVotes(proposalId, page, limit)
      // For now, we'll return a placeholder response indicating this limitation

      return {
        votes: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        message:
          'Vote listing not available in current contract implementation. Use getVoteDetails for specific voter queries.',
      }
    } catch (error) {
      this.logger.error(`Error getting proposal votes: ${error.message}`)
      throw new Error('Failed to fetch proposal votes')
    }
  }

  async setGovernanceParams(paramsDto: {
    brandId: string
    votingDuration: number
    quorumPercentage: number
    approvalPercentage: number
    userWalletAddress?: string
  }): Promise<any> {
    const { brandId, votingDuration, quorumPercentage, approvalPercentage, userWalletAddress } =
      paramsDto
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      const contract = await this.getContractWithSigner(userWalletAddress)
      const tx = await contract.setGovernanceParams(
        brandIdBN,
        votingDuration,
        quorumPercentage,
        approvalPercentage,
      )
      const receipt = await tx.wait()
      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Error setting governance params: ${error.message}`)
      return {
        hash: error.transaction?.hash,
        success: false,
        error: error.message,
      }
    }
  }

  async getGovernanceParams(brandId: string): Promise<any> {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      const params = await this.contract.brandParams(brandIdBN)
      return {
        votingDuration: Number(params.votingDuration),
        quorumPercentage: Number(params.quorumPercentage),
        approvalPercentage: Number(params.approvalPercentage),
      }
    } catch (error) {
      this.logger.error(`Error getting governance params: ${error.message}`)
      throw new BadRequestException(ErrorKey.PARAMS_FETCH_FAILED)
    }
  }

  async pause(userWalletAddress?: string): Promise<any> {
    try {
      const contract = await this.getContractWithSigner(userWalletAddress)
      const tx = await contract.pause()
      const receipt = await tx.wait()
      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Error pausing contract: ${error.message}`)
      return {
        hash: error.transaction?.hash,
        success: false,
        error: error.message,
      }
    }
  }

  async unpause(userWalletAddress?: string): Promise<any> {
    try {
      const contract = await this.getContractWithSigner(userWalletAddress)
      const tx = await contract.unpause()
      const receipt = await tx.wait()
      return {
        hash: receipt.hash,
        success: true,
      }
    } catch (error) {
      this.logger.error(`Error unpausing contract: ${error.message}`)
      return {
        hash: error.transaction?.hash,
        success: false,
        error: error.message,
      }
    }
  }

  async isPaused(): Promise<boolean> {
    try {
      return await this.contract.paused()
    } catch (error) {
      this.logger.error(`Error checking pause status: ${error.message}`)
      throw new BadRequestException(ErrorKey.CONTRACT_INTERACTION_FAILED)
    }
  }

  async updateBTManager(updateBTManagerDto: {
    btManager: string
    userWalletAddress?: string
  }): Promise<any> {
    const { btManager, userWalletAddress } = updateBTManagerDto
    this.logger.log(`Updating BT Manager to: ${btManager}`)
    try {
      // Validate Ethereum address format
      if (!ethers.isAddress(btManager)) {
        throw new Error('Invalid BT Manager address format')
      }

      // Normalize the address to proper checksum format
      const normalizedBTManager = ethers.getAddress(btManager)
      this.logger.log(`Normalized BT Manager address: ${normalizedBTManager}`)

      return this.executeWithRetry(async () => {
        const contract = await this.getContractWithSigner(userWalletAddress)

        const tx = await contract.updateBTManager(normalizedBTManager)

        this.logger.log(`BT Manager update transaction sent: ${tx.hash}`)

        const receipt = await tx.wait()

        this.logger.log(`BT Manager updated successfully in block ${receipt.blockNumber}`)

        return {
          success: true,
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          message: `BT Manager updated to ${normalizedBTManager}`,
        }
      })
    } catch (error) {
      this.logger.error(`Error updating BT Manager: ${error.message}`)
      return {
        success: false,
        hash: '',
        blockNumber: 0,
        gasUsed: '0',
        error: `Failed to update BT Manager: ${error.message}`,
      }
    }
  }

  // ===========================================
  // TOKEN GOVERNANCE - FIGMA FEATURES
  // ===========================================

  // CATEGORY 8: TOKEN DISTRIBUTION GOVERNANCE

  // Commented out by request: distributeTokensManually
  // async distributeTokensManually(manualDistributionDto: {
  //   brandId: string
  //   recipients: string[]
  //   amounts: number[]
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { brandId, recipients, amounts, userWalletAddress } = manualDistributionDto
  //   try {
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     // Validate inputs
  //     if (recipients.length !== amounts.length) {
  //       throw new Error('Recipients and amounts arrays must have the same length')
  //     }

  //     if (recipients.length === 0) {
  //       throw new Error('No recipients provided')
  //     }

  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     this.logger.log(
  //       `Manually distributing tokens to ${recipients.length} recipients for brand ${brandId}`,
  //     )

  //     // Convert amounts to BigInt array
  //     const amountsInWei = amounts.map((amount) => ethers.parseEther(amount.toString()))

  //     const tx = await this.executeWithRetry(() =>
  //       contract.distributeTokensManually(brandIdBN, recipients, amountsInWei),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Successfully distributed tokens to ${recipients.length} recipients`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error distributing tokens manually: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to distribute tokens manually: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: processCSVDistribution
  // async processCSVDistribution(csvUploadDto: {
  //   brandId: string
  //   csvData: string
  //   validateOnly?: boolean
  // }): Promise<{
  //   success: boolean
  //   validRecords: number
  //   invalidRecords: number
  //   previewData: any[]
  // }> {
  //   const { brandId, csvData, validateOnly } = csvUploadDto
  //   try {
  //     this.logger.log(`Processing CSV distribution for brand ${brandId}`)

  //     // Parse CSV data
  //     const lines = csvData.trim().split('\n')
  //     const headers = lines[0]
  //       .toLowerCase()
  //       .split(',')
  //       .map((h) => h.trim())

  //     // Validate headers
  //     if (!headers.includes('address') || !headers.includes('amount')) {
  //       throw new Error('CSV must contain "address" and "amount" columns')
  //     }

  //     const addressIndex = headers.indexOf('address')
  //     const amountIndex = headers.indexOf('amount')

  //     const validRecords: any[] = []
  //     const invalidRecords: any[] = []

  //     // Process each data row
  //     for (let i = 1; i < lines.length; i++) {
  //       const columns = lines[i].split(',').map((c) => c.trim())

  //       if (columns.length < Math.max(addressIndex, amountIndex) + 1) {
  //         invalidRecords.push({
  //           line: i + 1,
  //           data: lines[i],
  //           error: 'Insufficient columns',
  //         })
  //         continue
  //       }

  //       const address = columns[addressIndex]
  //       const amount = columns[amountIndex]

  //       // Validate address
  //       if (!ethers.isAddress(address)) {
  //         invalidRecords.push({
  //           line: i + 1,
  //           address,
  //           amount,
  //           error: 'Invalid Ethereum address',
  //         })
  //         continue
  //       }

  //       // Validate amount
  //       const numAmount = parseFloat(amount)
  //       if (isNaN(numAmount) || numAmount <= 0) {
  //         invalidRecords.push({
  //           line: i + 1,
  //           address,
  //           amount,
  //           error: 'Invalid amount',
  //         })
  //         continue
  //       }

  //       validRecords.push({
  //         address: ethers.getAddress(address), // Normalize to checksum address
  //         amount: numAmount,
  //         line: i + 1,
  //       })
  //     }

  //     this.logger.log(
  //       `CSV processing: ${validRecords.length} valid, ${invalidRecords.length} invalid records`,
  //     )

  //     return {
  //       success: true,
  //       validRecords: validRecords.length,
  //       invalidRecords: invalidRecords.length,
  //       previewData: validateOnly ? validRecords.slice(0, 10) : validRecords, // Return first 10 for preview
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error processing CSV distribution: ${error.message}`)
  //     throw new Error(`Failed to process CSV: ${error.message}`)
  //   }
  // }

  // Commented out by request: executeCSVDistribution
  // async executeCSVDistribution(csvDistributionDto: {
  //   brandId: string
  //   distributionData: Array<{ address: string; amount: number }>
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { brandId, distributionData, userWalletAddress } = csvDistributionDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Executing CSV distribution for ${distributionData.length} recipients`)

  //     // Extract recipients and amounts
  //     const recipients = distributionData.map((item) => item.address)
  //     const amounts = distributionData.map((item) => ethers.parseEther(item.amount.toString()))

  //     const tx = await this.executeWithRetry(() =>
  //       contract.distributeTokensManually(brandIdBN, recipients, amounts),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Successfully executed CSV distribution to ${recipients.length} recipients`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error executing CSV distribution: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to execute CSV distribution: ${error.message}`,
  //     }
  //   }
  // }

  // CATEGORY 9: CONDITIONAL REWARD GOVERNANCE

  // Commented out by request: createRewardCondition
  // async createRewardCondition(conditionDto: {
  //   brandId: string
  //   conditionType: string
  //   requiredAmount: number
  //   duration: number
  //   rewardAmount: number
  //   description: string
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { brandId, conditionType, requiredAmount, duration, rewardAmount, description, userWalletAddress } = conditionDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Creating reward condition for brand ${brandId}: ${conditionType}`)

  //     const tx = await this.executeWithRetry(() =>
  //       contract.createRewardCondition(
  //         brandIdBN,
  //         conditionType,
  //         ethers.parseEther(requiredAmount.toString()),
  //         duration * 24 * 3600, // Convert days to seconds
  //         ethers.parseEther(rewardAmount.toString()),
  //         description,
  //       ),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Reward condition created successfully`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error creating reward condition: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to create reward condition: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: editRewardCondition
  // async editRewardCondition(editConditionDto: {
  //   conditionId: number
  //   requiredAmount?: number
  //   duration?: number
  //   rewardAmount?: number
  //   description?: string
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { conditionId, requiredAmount, duration, rewardAmount, description, userWalletAddress } = editConditionDto
  //   try {
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Editing reward condition ${conditionId}`)

  //     const tx = await this.executeWithRetry(() =>
  //       contract.editRewardCondition(
  //         conditionId,
  //         requiredAmount ? ethers.parseEther(requiredAmount.toString()) : BigInt(0),
  //         duration ? duration * 24 * 3600 : 0,
  //         rewardAmount ? ethers.parseEther(rewardAmount.toString()) : BigInt(0),
  //         description || '',
  //       ),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Reward condition edited successfully`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error editing reward condition: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to edit reward condition: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: setConditionSchedule
  // async setConditionSchedule(scheduleDto: {
  //   conditionId: number
  //   startTime: number
  //   endTime: number
  //   isActive: boolean
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { conditionId, startTime, endTime, isActive, userWalletAddress } = scheduleDto
  //   try {
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Setting schedule for condition ${conditionId}`)

  //     const tx = await this.executeWithRetry(() =>
  //       contract.setConditionSchedule(conditionId, startTime, endTime, isActive),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Condition schedule set successfully`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error setting condition schedule: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to set condition schedule: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: getRewardConditions
  // async getRewardConditions(rewardConditionsDto: {
  //   brandId: string
  // }): Promise<any[]> {
  //   const { brandId } = rewardConditionsDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     this.logger.log(`Getting reward conditions for brand ${brandId}`)

  //     const conditions = await this.contract.getRewardConditions(brandIdBN)

  //     return conditions.map((condition: any, index: number) => ({
  //       id: index.toString(),
  //       brandId: brandId.toString(),
  //       conditionType: condition.conditionType,
  //       requiredAmount: ethers.formatEther(condition.requiredAmount),
  //       duration: Number(condition.duration) / (24 * 3600), // Convert seconds to days
  //       rewardAmount: ethers.formatEther(condition.rewardAmount),
  //       description: condition.description,
  //       isActive: condition.isActive,
  //       startTime: condition.startTime.toString(),
  //       endTime: condition.endTime.toString(),
  //       totalClaimed: ethers.formatEther(condition.totalClaimed),
  //       recipientCount: Number(condition.recipientCount),
  //       createdAt: condition.createdAt.toString(),
  //     }))
  //   } catch (error) {
  //     this.logger.error(`Error getting reward conditions: ${error.message}`)
  //     throw new Error('Failed to fetch reward conditions')
  //   }
  // }

  // Commented out by request: validateCondition
  // async validateCondition(validateDto: {
  //   conditionId: number
  //   userAddress: string
  // }): Promise<any> {
  //   const { conditionId, userAddress } = validateDto
  //   try {
  //     this.logger.log(`Validating condition ${conditionId} for user ${userAddress}`)

  //     const validation = await this.contract.validateCondition(conditionId, userAddress)

  //     return {
  //       isValid: validation.isValid,
  //       userAddress,
  //       conditionId: conditionId.toString(),
  //       currentAmount: ethers.formatEther(validation.currentAmount),
  //       requiredAmount: ethers.formatEther(validation.requiredAmount),
  //       holdingDuration: Number(validation.holdingDuration),
  //       requiredDuration: Number(validation.requiredDuration),
  //       eligibleReward: ethers.formatEther(validation.eligibleReward),
  //       claimable: validation.claimable,
  //       reason: validation.reason || undefined,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error validating condition: ${error.message}`)
  //     throw new Error('Failed to validate condition')
  //   }
  // }

  // Commented out by request: processAutomaticRewards
  // async processAutomaticRewards(processDto: {
  //   brandId: string
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { brandId, userWalletAddress } = processDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Processing automatic rewards for brand ${brandId}`)

  //     const tx = await this.executeWithRetry(() => contract.processAutomaticRewards(brandIdBN))

  //     const _receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     // Get processing results from contract events or return values
  //     const processResults = await this.contract.getLastProcessingResults()

  //     return {
  //       totalProcessed: Number(processResults.totalProcessed),
  //       totalRewards: ethers.formatEther(processResults.totalRewards),
  //       eligibleUsers: Number(processResults.eligibleUsers),
  //       distributedUsers: Number(processResults.distributedUsers),
  //       failedDistributions: Number(processResults.failedDistributions),
  //       processedConditions: processResults.processedConditions.map((condition: any) => ({
  //         conditionId: condition.conditionId.toString(),
  //         recipients: Number(condition.recipients),
  //         totalReward: ethers.formatEther(condition.totalReward),
  //       })),
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error processing automatic rewards: ${error.message}`)
  //     throw new Error('Failed to process automatic rewards')
  //   }
  // }

  // CATEGORY 10: DISTRIBUTION HISTORY GOVERNANCE

  // Commented out by request: getDistributionHistory
  // async getDistributionHistory(distributionHistoryDto: {
  //   brandId: string
  //   page: number
  //   limit: number
  // }): Promise<any> {
  //   const { brandId, page, limit } = distributionHistoryDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     this.logger.log(`Getting distribution history for brand ${brandId}`)

  //     // Get distribution history from smart contract
  //     const historyResult = await this.contract.getDistributionHistory(brandIdBN, page - 1, limit)

  //     const distributions = historyResult.distributions.map((dist: any) => ({
  //       id: dist.id.toString(),
  //       type: dist.distributionType,
  //       brandId: brandId.toString(),
  //       totalTokens: dist.totalTokens.toString(),
  //       recipientCount: Number(dist.recipientCount),
  //       timestamp: new Date(Number(dist.timestamp) * 1000).toISOString(),
  //       status: dist.status,
  //       description: dist.description,
  //     }))

  //     this.logger.log(`Found ${distributions.length} distribution records`)
  //     return {
  //       distributions,
  //       pagination: {
  //         page,
  //         limit,
  //         total: Number(historyResult.total),
  //         totalPages: Math.ceil(Number(historyResult.total) / limit),
  //       },
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error getting distribution history: ${error.message}`)
  //     throw new Error('Failed to fetch distribution history')
  //   }
  // }

  // Commented out by request: getDistributionRecipients
  // async getDistributionRecipients(distributionRecipientsDto: {
  //   distributionId: number
  //   page: number
  //   limit: number
  // }): Promise<any> {
  //   const { distributionId, page, limit } = distributionRecipientsDto
  //   try {
  //     this.logger.log(`Getting distribution recipients for distribution ${distributionId}`)

  //     const recipients = await this.contract.getDistributionRecipients(
  //       distributionId,
  //       page - 1,
  //       limit,
  //     )

  //     return {
  //       recipients: recipients.recipients.map((recipient: any) => ({
  //         address: recipient.address,
  //         amount: ethers.formatEther(recipient.amount),
  //         status: recipient.status,
  //         timestamp: new Date(Number(recipient.timestamp) * 1000).toISOString(),
  //         txHash: recipient.txHash || undefined,
  //       })),
  //       pagination: {
  //         page,
  //         limit,
  //         total: Number(recipients.total),
  //         totalPages: Math.ceil(Number(recipients.total) / limit),
  //       },
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error getting distribution recipients: ${error.message}`)
  //     throw new Error('Failed to fetch distribution recipients')
  //   }
  // }

  // Commented out by request: createDistributionCampaign
  // async createDistributionCampaign(campaignDto: {
  //   brandId: string
  //   name: string
  //   description: string
  //   startTime: number
  //   endTime: number
  //   totalTokens: number
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { brandId, name, description, startTime, endTime, totalTokens, userWalletAddress } = campaignDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Creating distribution campaign: ${name}`)

  //     const tx = await this.executeWithRetry(() =>
  //       contract.createDistributionCampaign(
  //         brandIdBN,
  //         name,
  //         description,
  //         startTime,
  //         endTime,
  //         ethers.parseEther(totalTokens.toString()),
  //       ),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Distribution campaign "${name}" created successfully`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error creating distribution campaign: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to create distribution campaign: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: getDistributionCampaigns
  // async getDistributionCampaigns(distributionCampaignsDto: {
  //   brandId: string
  // }): Promise<any[]> {
  //   const { brandId } = distributionCampaignsDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     this.logger.log(`Getting distribution campaigns for brand ${brandId}`)

  //     const campaigns = await this.contract.getDistributionCampaigns(brandIdBN)

  //     return campaigns.map((campaign: any) => ({
  //       id: campaign.id.toString(),
  //       brandId: brandId.toString(),
  //       name: campaign.name,
  //       description: campaign.description,
  //       startTime: new Date(Number(campaign.startTime) * 1000).toISOString(),
  //       endTime: new Date(Number(campaign.endTime) * 1000).toISOString(),
  //       totalTokens: ethers.formatEther(campaign.totalTokens),
  //       distributedTokens: ethers.formatEther(campaign.distributedTokens),
  //       remainingTokens: ethers.formatEther(campaign.totalTokens - campaign.distributedTokens),
  //       recipientCount: Number(campaign.recipientCount),
  //       status: campaign.status,
  //       createdAt: new Date(Number(campaign.createdAt) * 1000).toISOString(),
  //     }))
  //   } catch (error) {
  //     this.logger.error(`Error getting distribution campaigns: ${error.message}`)
  //     throw new Error('Failed to fetch distribution campaigns')
  //   }
  // }

  // Commented out by request: getCampaignById
  // async getCampaignById(campaignByIdDto: {
  //   campaignId: number
  // }): Promise<any> {
  //   const { campaignId } = campaignByIdDto
  //   try {
  //     this.logger.log(`Getting campaign ${campaignId}`)

  //     // We need to search through all brands to find the campaign
  //     // This is a limitation of the current contract design
  //     // In a real implementation, you might want to store campaign-to-brand mapping
  //     const allBrands = [1, 2, 3, 4, 5] // This should be dynamic based on your brand IDs

  //     for (const brandId of allBrands) {
  //       try {
  //         const campaigns = await this.contract.getDistributionCampaigns(brandId)
  //         const campaign = campaigns.find((c: any) => c.id.toString() === campaignId.toString())

  //         if (campaign) {
  //           return {
  //             id: campaign.id.toString(),
  //             brandId: brandId.toString(),
  //             name: campaign.name,
  //             description: campaign.description,
  //             startTime: new Date(Number(campaign.startTime) * 1000).toISOString(),
  //             endTime: new Date(Number(campaign.endTime) * 1000).toISOString(),
  //             totalTokens: ethers.formatEther(campaign.totalTokens),
  //             distributedTokens: ethers.formatEther(campaign.distributedTokens),
  //             remainingTokens: ethers.formatEther(
  //               campaign.totalTokens - campaign.distributedTokens,
  //             ),
  //             recipientCount: Number(campaign.recipientCount),
  //             status: campaign.status,
  //             createdAt: new Date(Number(campaign.createdAt) * 1000).toISOString(),
  //           }
  //         }
  //       } catch (error) {
  //         // Continue to next brand if this one fails
  //         continue
  //       }
  //     }

  //     throw new Error('Campaign not found')
  //   } catch (error) {
  //     this.logger.error(`Error getting campaign by ID: ${error.message}`)
  //     throw new Error('Failed to fetch campaign')
  //   }
  // }

  // Commented out by request: closeCampaign
  // async closeCampaign(closeDto: {
  //   campaignId: number
  //   reason: string
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { campaignId, reason, userWalletAddress } = closeDto
  //   try {
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Closing campaign ${campaignId}: ${reason}`)

  //     const tx = await this.executeWithRetry(() => contract.closeCampaign(campaignId, reason))

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Campaign closed successfully: ${reason}`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error closing campaign: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to close campaign: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: updateCampaign
  // async updateCampaign(updateDto: {
  //   campaignId: number
  //   name: string
  //   description: string
  //   startTime: number
  //   endTime: number
  //   totalTokens: number
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { campaignId, name, description, startTime, endTime, totalTokens, userWalletAddress } = updateDto
  //   try {
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Updating campaign ${campaignId}: ${name}`)

  //     const tx = await this.executeWithRetry(() =>
  //       contract.updateCampaign(
  //         campaignId,
  //         name,
  //         description,
  //         startTime,
  //         endTime,
  //         ethers.parseEther(totalTokens.toString()),
  //       ),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Campaign "${name}" updated successfully`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error updating campaign: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to update campaign: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: deleteCampaign
  // async deleteCampaign(deleteDto: {
  //   campaignId: number
  //   reason: string
  //   forceDelete?: boolean
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { campaignId, reason, forceDelete = false, userWalletAddress } = deleteDto
  //   try {
  //     const contract = await this.getContractWithSigner(userWalletAddress)

  //     this.logger.log(`Deleting campaign ${campaignId}: ${reason} (force: ${forceDelete})`)

  //     const tx = await this.executeWithRetry(() =>
  //       contract.deleteCampaign(campaignId, reason, forceDelete),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Campaign deleted successfully: ${reason}`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error deleting campaign: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to delete campaign: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: getCampaignStatistics
  // async getCampaignStatistics(campaignStatisticsDto: {
  //   campaignId: number
  // }): Promise<any> {
  //   const { campaignId } = campaignStatisticsDto
  //   try {
  //     this.logger.log(`Getting statistics for campaign ${campaignId}`)

  //     const stats = await this.contract.getCampaignStatistics(campaignId)

  //     return {
  //       campaignId: campaignId.toString(),
  //       totalAllocated: ethers.formatEther(stats.totalAllocated),
  //       totalDistributed: ethers.formatEther(stats.totalDistributed),
  //       remainingTokens: ethers.formatEther(stats.totalAllocated - stats.totalDistributed),
  //       recipientCount: Number(stats.recipientCount),
  //       distributionCount: Number(stats.distributionCount),
  //       averageDistribution: ethers.formatEther(stats.averageDistribution),
  //       participationRate: `${stats.participationRate}%`,
  //       completionRate: `${stats.completionRate}%`,
  //       timeRemaining: stats.timeRemaining.toString(),
  //       dailyDistribution: ethers.formatEther(stats.dailyDistribution),
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error getting campaign statistics: ${error.message}`)
  //     throw new Error('Failed to fetch campaign statistics')
  //   }
  // }

  // CATEGORY 11: TOKEN ALLOCATION GOVERNANCE

  // Commented out by request: allocateTokensForRewards
  // async allocateTokensForRewards(allocationDto: {
  //   brandId?: string
  //   amount: number
  //   source: string
  //   userWalletAddress?: string
  // }): Promise<any> {
  //   const { brandId, amount, source, userWalletAddress } = allocationDto
  //   try {
  //     const contract = await this.getContractWithSigner(userWalletAddress)
  //     const brandIdBN = brandId ? this.uuidToBigNumber(brandId) : undefined

  //     this.logger.log(`Allocating ${amount} tokens for rewards from ${source}`)

  //     const tx = await this.executeWithRetry(() =>
  //       contract.allocateTokensForRewards(brandIdBN, ethers.parseEther(amount.toString()), source),
  //     )

  //     const receipt = await tx.wait(BLOCKS_TO_WAIT)

  //     return {
  //       hash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       gasUsed: receipt.gasUsed.toString(),
  //       status: receipt.status,
  //       success: true,
  //       message: `Successfully allocated ${amount} tokens for rewards`,
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error allocating tokens for rewards: ${error.message}`)
  //     return {
  //       hash: error.transaction?.hash,
  //       success: false,
  //       error: `Failed to allocate tokens for rewards: ${error.message}`,
  //     }
  //   }
  // }

  // Commented out by request: getTokenAllocationSummary
  // async getTokenAllocationSummary(tokenAllocationSummaryDto: {
  //   brandId: string
  // }): Promise<any> {
  //   const { brandId } = tokenAllocationSummaryDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     this.logger.log(`Getting token allocation summary for brand ${brandId}`)

  //     const summary = await this.contract.getTokenAllocationSummary(brandIdBN)

  //     return {
  //       brandId: brandId.toString(),
  //       totalSupply: ethers.formatEther(summary.totalSupply),
  //       totalAllocated: ethers.formatEther(summary.totalAllocated),
  //       availableForRewards: ethers.formatEther(summary.availableForRewards),
  //       distributedRewards: ethers.formatEther(summary.distributedRewards),
  //       pendingRewards: ethers.formatEther(summary.pendingRewards),
  //       reservedTokens: ethers.formatEther(summary.reservedTokens),
  //       allocationBreakdown: {
  //         treasury: ethers.formatEther(summary.breakdown.treasury),
  //         rewards: ethers.formatEther(summary.breakdown.rewards),
  //         staking: ethers.formatEther(summary.breakdown.staking),
  //         liquidity: ethers.formatEther(summary.breakdown.liquidity),
  //         team: ethers.formatEther(summary.breakdown.team),
  //         marketing: ethers.formatEther(summary.breakdown.marketing),
  //       },
  //       allocationHistory: summary.history.map((entry: any) => ({
  //         timestamp: new Date(Number(entry.timestamp) * 1000).toISOString(),
  //         amount: ethers.formatEther(entry.amount),
  //         source: entry.source,
  //         purpose: entry.purpose,
  //         txHash: entry.txHash,
  //       })),
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error getting token allocation summary: ${error.message}`)
  //     throw new Error('Failed to fetch token allocation summary')
  //   }
  // }

  // Commented out by request: getAvailableTokensForRewards
  // async getAvailableTokensForRewards(availableTokensDto: {
  //   brandId: string
  // }): Promise<{ availableTokens: string; totalAllocated: string }> {
  //   const { brandId } = availableTokensDto
  //   try {
  //     const brandIdBN = this.uuidToBigNumber(brandId)
  //     this.logger.log(`Getting available tokens for rewards for brand ${brandId}`)

  //     // Get token allocation from smart contract
  //     const allocation = await this.contract.getTokenAllocation(brandIdBN)

  //     return {
  //       availableTokens: ethers.formatEther(allocation.availableForRewards),
  //       totalAllocated: ethers.formatEther(allocation.totalAllocated),
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error getting available tokens: ${error.message}`)
  //     throw new Error('Failed to fetch available tokens for rewards')
  //   }
  // }
}
