import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { ethers } from 'ethers'
import { PerkManagerABI } from '../abi/PerkManager.abi'
import {
  CreatePerkDto,
  NFTPerkConfigDto,
  UpdatePerkStatusDto,
  UpdatePerkInfoDto,
  UpdatePerkRequirementsDto,
  ClaimPerkDto,
  PerkDetails,
} from '../interfaces/perk-manager.interfaces'

@Injectable()
export class PerkManagerService implements OnModuleInit {
  private readonly logger = new Logger(PerkManagerService.name)
  private provider: ethers.JsonRpcProvider
  private perkManagerContract: ethers.Contract
  private adminWallet: ethers.Wallet
  private maxRetries = 3
  private debugMode = false // Disable in production
  private cacheTTL = 5 * 60 * 1000 // 5 minutes in milliseconds
  private contractAddress: string

  // Create a map to store mock overrides for testing
  public readonly mockEligibilityOverrides = new Map<string, boolean>()

  public getEligibilityKey(brandId: string, perkId: string, userAddress: string): string {
    return `${brandId}:${perkId}:${userAddress}`.toLowerCase()
  }

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.initializeBlockchainConnection()
  }

  private async initializeBlockchainConnection() {
    try {
      const rpcURL = this.configService.get<string>('blockchain.provider.rpcURL')
      const network = {
        name: this.configService.get<string>('blockchain.provider.network'),
        chainId: parseInt(this.configService.get<string>('blockchain.chainId')),
      }

      this.provider = new ethers.JsonRpcProvider(rpcURL, network)

      // Initialize admin wallet
      const adminKey = this.configService.get<string>('blockchain.adminKey')
      this.adminWallet = new ethers.Wallet(adminKey, this.provider)

      // Get contract address with fallback mechanism
      const directPerkManagerValue = process.env.PERK_MANAGER
      const perkManagerAddress = this.configService.get<string>(
        'blockchain.contract.perkManager.address',
      )
      this.contractAddress = directPerkManagerValue || perkManagerAddress

      if (!this.contractAddress) {
        throw new Error('PerkManager contract address not configured')
      }

      // Verify contract exists
      const code = await this.provider.getCode(this.contractAddress)
      if (code === '0x') {
        throw new Error(`No contract found at address ${this.contractAddress}`)
      }

      this.perkManagerContract = new ethers.Contract(
        this.contractAddress,
        PerkManagerABI,
        this.adminWallet,
      )

      this.logger.log(`Blockchain connection initialized. Contract: ${this.contractAddress}`)
    } catch (error: any) {
      this.logger.error(`Failed to initialize blockchain connection: ${error.message}`)
      throw new Error(`Failed to connect to blockchain: ${error.message}`)
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries,
  ): Promise<T> {
    let lastError: any
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        this.logger.warn(
          `Transaction failed, retrying... (${attempt + 1}/${retries}): ${error.message}`,
        )
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1))) // Exponential backoff
      }
    }

    this.logger.error(`Transaction failed after ${retries} attempts: ${lastError.message}`)
    throw lastError
  }

  private convertIdToNumeric(id: string): bigint {
    // If it's already a pure numeric string, use it directly
    if (/^\d+$/.test(id)) {
      return BigInt(id)
    }

    // If it's a UUID, convert it to hex format then to BigInt
    if (id.includes('-')) {
      const hexString = '0x' + id.replace(/-/g, '')
      return ethers.toBigInt(hexString)
    }

    // For other string formats, hash them (fallback)
    const idHash = ethers.keccak256(ethers.toUtf8Bytes(id))
    return ethers.toBigInt(idHash) % BigInt(Number.MAX_SAFE_INTEGER)
  }

  // Generic method for handling contract transactions
  private async executeContractTransaction<T>(
    method: string,
    params: any[],
    errorHandlers: Record<string, string> = {},
  ): Promise<T> {
    try {
      const contract = this.perkManagerContract

      // Pre-flight check with gas estimation
      try {
        await contract[method].estimateGas(...params)
      } catch (estimateError: any) {
        this.logger.error(`Gas estimation failed for ${method}: ${estimateError.message}`)
        throw new Error(`Transaction validation failed: ${estimateError.message}`)
      }

      const tx = await this.executeWithRetry(() => contract[method](...params))
      const receipt = await tx.wait()

      this.logger.log(`${method} executed successfully. TxHash: ${receipt.hash}`)

      // Create response object without using spread operator
      const response: any = {
        success: true,
        transactionHash: receipt.hash,
      }

      // Add primitive parameters to response
      params.forEach((param, index) => {
        if (typeof param !== 'object') {
          response[`param${index}`] = param.toString()
        }
      })

      return response as T
    } catch (error: any) {
      this.logger.error(`Failed to execute ${method}: ${error.message}`)

      // Handle specific error cases
      for (const [errorPattern, errorMessage] of Object.entries(errorHandlers)) {
        if (error.message.includes(errorPattern)) {
          throw new Error(errorMessage)
        }
      }

      throw new Error(`Failed to execute ${method}: ${error.message}`)
    }
  }

  // Generic method for read-only contract calls with caching
  private async cachedContractCall<T>(cacheKey: string, method: string, params: any[]): Promise<T> {
    try {
      // Try to get from cache first
      const cachedResult = await this.cacheManager.get<T>(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      const result = await this.perkManagerContract[method](...params)

      // Store in cache for future use
      await this.cacheManager.set(cacheKey, result, this.cacheTTL)

      return result
    } catch (error: any) {
      this.logger.error(`Failed to execute ${method}: ${error.message}`)
      throw new Error(`Failed to execute ${method}: ${error.message}`)
    }
  }

  async createPerk(createPerkDto: CreatePerkDto): Promise<any> {
    this.logger.log(`Creating perk for brand: ${createPerkDto.brandId}`)

    const brandIdNumeric = this.convertIdToNumeric(createPerkDto.brandId)

    const params = [
      brandIdNumeric,
      createPerkDto.name,
      createPerkDto.description,
      createPerkDto.perkType,
      createPerkDto.minHoldingAmount,
      createPerkDto.minHoldingDuration,
      createPerkDto.startTime,
      createPerkDto.endTime,
      createPerkDto.requiresStaking,
      createPerkDto.requiresLPStaking,
    ]

    return this.executeContractTransaction('createPerk', params, {
      'Perk already exists': 'A perk with this ID already exists for this brand',
      'Brand not found': 'The specified brand does not exist',
      'Invalid requirements': 'The perk requirements are invalid',
    })
  }

  async configureNFTPerk(
    brandId: string,
    perkId: string,
    configDto: NFTPerkConfigDto,
  ): Promise<any> {
    this.logger.log(`Configuring NFT perk for brand: ${brandId}, perk: ${perkId}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const perkIdNumeric = this.convertIdToNumeric(perkId)

    const params = [
      brandIdNumeric,
      perkIdNumeric,
      configDto.tokenURI,
      configDto.maxSupply,
      configDto.transferable,
      configDto.perkType,
      configDto.discountAmount,
      configDto.discountPercent,
      configDto.duration,
    ]

    return this.executeContractTransaction('configureNFTPerk', params, {
      'Perk not found': 'The specified perk does not exist',
      'Invalid NFT configuration': 'The NFT configuration is invalid',
    })
  }

  async updatePerkStatus(updateStatusDto: UpdatePerkStatusDto): Promise<any> {
    this.logger.log(
      `Updating perk status for brand: ${updateStatusDto.brandId}, perk: ${updateStatusDto.perkId}`,
    )

    const brandIdNumeric = this.convertIdToNumeric(updateStatusDto.brandId)
    const perkIdNumeric = this.convertIdToNumeric(updateStatusDto.perkId)

    const params = [brandIdNumeric, perkIdNumeric, updateStatusDto.active]

    return this.executeContractTransaction('updatePerkStatus', params, {
      'Perk not found': 'The specified perk does not exist',
      Unauthorized: 'You are not authorized to update this perk',
    })
  }

  async updatePerkInfo(updateInfoDto: UpdatePerkInfoDto): Promise<any> {
    this.logger.log(
      `Updating perk info for brand: ${updateInfoDto.brandId}, perk: ${updateInfoDto.perkId}`,
    )

    const brandIdNumeric = this.convertIdToNumeric(updateInfoDto.brandId)
    const perkIdNumeric = this.convertIdToNumeric(updateInfoDto.perkId)

    const params = [brandIdNumeric, perkIdNumeric, updateInfoDto.name, updateInfoDto.description]

    return this.executeContractTransaction('updatePerkInfo', params, {
      'Perk not found': 'The specified perk does not exist',
      Unauthorized: 'You are not authorized to update this perk',
    })
  }

  async updatePerkRequirements(updateReqDto: UpdatePerkRequirementsDto): Promise<any> {
    this.logger.log(
      `Updating perk requirements for brand: ${updateReqDto.brandId}, perk: ${updateReqDto.perkId}`,
    )

    const brandIdNumeric = this.convertIdToNumeric(updateReqDto.brandId)
    const perkIdNumeric = this.convertIdToNumeric(updateReqDto.perkId)

    const params = [
      brandIdNumeric,
      perkIdNumeric,
      updateReqDto.minHoldingAmount,
      updateReqDto.minHoldingDuration,
      updateReqDto.startTime,
      updateReqDto.endTime,
      updateReqDto.requiresStaking,
      updateReqDto.requiresLPStaking,
    ]

    return this.executeContractTransaction('updatePerkRequirements', params, {
      'Perk not found': 'The specified perk does not exist',
      'Invalid requirements': 'The perk requirements are invalid',
      Unauthorized: 'You are not authorized to update this perk',
    })
  }

  async claimPerk(claimPerkDto: ClaimPerkDto): Promise<any> {
    this.logger.log(
      `Claiming perk for brand: ${claimPerkDto.brandId}, perk: ${claimPerkDto.perkId}, user: ${claimPerkDto.userAddress}`,
    )

    const brandIdNumeric = this.convertIdToNumeric(claimPerkDto.brandId)
    const perkIdNumeric = this.convertIdToNumeric(claimPerkDto.perkId)

    const params = [brandIdNumeric, perkIdNumeric, claimPerkDto.userAddress]

    return this.executeContractTransaction('claimPerk', params, {
      'Perk not found': 'The specified perk does not exist',
      'Not eligible': 'User is not eligible for this perk',
      'Already claimed': 'This perk has already been claimed by the user',
    })
  }

  async claimNFTPerk(claimPerkDto: ClaimPerkDto): Promise<any> {
    this.logger.log(
      `Claiming NFT perk for brand: ${claimPerkDto.brandId}, perk: ${claimPerkDto.perkId}, user: ${claimPerkDto.userAddress}`,
    )

    const brandIdNumeric = this.convertIdToNumeric(claimPerkDto.brandId)
    const perkIdNumeric = this.convertIdToNumeric(claimPerkDto.perkId)

    const params = [brandIdNumeric, perkIdNumeric, claimPerkDto.userAddress]

    return this.executeContractTransaction('claimNFTPerk', params, {
      'Perk not found': 'The specified perk does not exist',
      'Not eligible': 'User is not eligible for this perk',
      'Already claimed': 'This perk has already been claimed by the user',
      'NFT transfer failed': 'Failed to transfer NFT to user',
    })
  }

  async getBrandPerks(brandId: string): Promise<string[]> {
    this.logger.log(`Getting perks for brand: ${brandId}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const cacheKey = `brand_perks_${brandId}`

    try {
      const perks = await this.cachedContractCall<string[]>(cacheKey, 'getBrandPerks', [
        brandIdNumeric,
      ])
      return perks || []
    } catch (error: any) {
      this.logger.error(`Failed to get brand perks: ${error.message}`)
      return []
    }
  }

  async getAvailablePerks(brandId: string, userAddress: string): Promise<string[]> {
    this.logger.log(`Getting available perks for brand: ${brandId}, user: ${userAddress}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const cacheKey = `available_perks_${brandId}_${userAddress}`

    try {
      const perks = await this.cachedContractCall<string[]>(cacheKey, 'getAvailablePerks', [
        brandIdNumeric,
        userAddress,
      ])
      return perks || []
    } catch (error: any) {
      this.logger.error(`Failed to get available perks: ${error.message}`)
      return []
    }
  }

  async isEligibleForPerk(brandId: string, perkId: string, userAddress: string): Promise<boolean> {
    this.logger.log(
      `Checking eligibility for brand: ${brandId}, perk: ${perkId}, user: ${userAddress}`,
    )

    // Check for mock override first
    const eligibilityKey = this.getEligibilityKey(brandId, perkId, userAddress)
    if (this.mockEligibilityOverrides.has(eligibilityKey)) {
      return this.mockEligibilityOverrides.get(eligibilityKey)!
    }

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const perkIdNumeric = this.convertIdToNumeric(perkId)
    const cacheKey = `eligibility_${brandId}_${perkId}_${userAddress}`

    try {
      const isEligible = await this.cachedContractCall<boolean>(cacheKey, 'isEligibleForPerk', [
        brandIdNumeric,
        perkIdNumeric,
        userAddress,
      ])
      return isEligible || false
    } catch (error: any) {
      this.logger.error(`Failed to check eligibility: ${error.message}`)
      return false
    }
  }

  async getPerkDetails(brandId: string, perkId: string): Promise<PerkDetails> {
    this.logger.log(`Getting perk details for brand: ${brandId}, perk: ${perkId}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const perkIdNumeric = this.convertIdToNumeric(perkId)
    const cacheKey = `perk_details_${brandId}_${perkId}`

    try {
      const details = await this.cachedContractCall<any>(cacheKey, 'getPerkDetails', [
        brandIdNumeric,
        perkIdNumeric,
      ])

      return {
        brandId: brandId,
        perkId: perkId,
        perkType: details.perkType,
        name: details.name || '',
        description: details.description || '',
        requirements: details.requirements || {},
        active: details.active || false,
        startDate: details.startDate ? new Date(details.startDate) : new Date(0),
        endDate: details.endDate ? new Date(details.endDate) : new Date(0),
        maxClaims: details.maxClaims || 0,
        claimedCount: details.claimedCount || 0,
        isNFT: details.isNFT,
        tokenURI: details.tokenURI,
        maxSupply: details.maxSupply,
        transferable: details.transferable,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get perk details: ${error.message}`)
      throw new Error(`Failed to get perk details: ${error.message}`)
    }
  }

  async checkBrandExists(brandId: string): Promise<{ exists: boolean }> {
    this.logger.log(`Checking if brand exists: ${brandId}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const cacheKey = `brand_exists_${brandId}`

    try {
      const exists = await this.cachedContractCall<boolean>(cacheKey, 'checkBrandExists', [
        brandIdNumeric,
      ])
      return { exists: exists || false }
    } catch (error: any) {
      this.logger.error(`Failed to check brand existence: ${error.message}`)
      return { exists: false }
    }
  }

  async getUserHoldings(brandId: string, userAddress: string): Promise<any> {
    this.logger.log(`Getting user holdings for brand: ${brandId}, user: ${userAddress}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const cacheKey = `user_holdings_${brandId}_${userAddress}`

    try {
      const holdings = await this.cachedContractCall<any>(cacheKey, 'getUserHoldings', [
        brandIdNumeric,
        userAddress,
      ])
      return (
        holdings || {
          tokenBalance: '0',
          lpBalance: '0',
          stakingBalance: '0',
        }
      )
    } catch (error: any) {
      this.logger.error(`Failed to get user holdings: ${error.message}`)
      return {
        tokenBalance: '0',
        lpBalance: '0',
        stakingBalance: '0',
      }
    }
  }

  async getUserLPHoldings(brandId: string, userAddress: string): Promise<any> {
    this.logger.log(`Getting user LP holdings for brand: ${brandId}, user: ${userAddress}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const cacheKey = `user_lp_holdings_${brandId}_${userAddress}`

    try {
      const lpHoldings = await this.cachedContractCall<any>(cacheKey, 'getUserLPHoldings', [
        brandIdNumeric,
        userAddress,
      ])
      return (
        lpHoldings || {
          lpBalance: '0',
          lpShare: '0',
        }
      )
    } catch (error: any) {
      this.logger.error(`Failed to get user LP holdings: ${error.message}`)
      return {
        lpBalance: '0',
        lpShare: '0',
      }
    }
  }

  async getUserHoldingStartTime(brandId: string, userAddress: string): Promise<any> {
    this.logger.log(`Getting user holding start time for brand: ${brandId}, user: ${userAddress}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const cacheKey = `user_holding_start_${brandId}_${userAddress}`

    try {
      const startTime = await this.cachedContractCall<any>(cacheKey, 'getUserHoldingStartTime', [
        brandIdNumeric,
        userAddress,
      ])
      return {
        startTime: startTime || 0,
        timestamp: new Date(Number(startTime) * 1000).toISOString(),
      }
    } catch (error: any) {
      this.logger.error(`Failed to get user holding start time: ${error.message}`)
      return {
        startTime: 0,
        timestamp: new Date(0).toISOString(),
      }
    }
  }

  async getNFTPerkConfig(brandId: string, perkId: string): Promise<any> {
    this.logger.log(`Getting NFT perk config for brand: ${brandId}, perk: ${perkId}`)

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const perkIdNumeric = this.convertIdToNumeric(perkId)
    const cacheKey = `nft_perk_config_${brandId}_${perkId}`

    try {
      const config = await this.cachedContractCall<any>(cacheKey, 'getNFTPerkConfig', [
        brandIdNumeric,
        perkIdNumeric,
      ])
      return (
        config || {
          nftContractAddress: '',
          tokenId: 0,
          quantity: 1,
        }
      )
    } catch (error: any) {
      this.logger.error(`Failed to get NFT perk config: ${error.message}`)
      return {
        nftContractAddress: '',
        tokenId: 0,
        quantity: 1,
      }
    }
  }

  async getPerkEligibilityDetails(
    brandId: string,
    perkId: string,
    userAddress: string,
  ): Promise<any> {
    this.logger.log(
      `Getting perk eligibility details for brand: ${brandId}, perk: ${perkId}, user: ${userAddress}`,
    )

    const brandIdNumeric = this.convertIdToNumeric(brandId)
    const perkIdNumeric = this.convertIdToNumeric(perkId)
    const cacheKey = `perk_eligibility_details_${brandId}_${perkId}_${userAddress}`

    try {
      const eligibilityDetails = await this.cachedContractCall<any>(
        cacheKey,
        'getPerkEligibilityDetails',
        [brandIdNumeric, perkIdNumeric, userAddress],
      )
      return (
        eligibilityDetails || {
          isEligible: false,
          requirements: [],
          userHoldings: {
            tokenBalance: '0',
            lpBalance: '0',
            stakingBalance: '0',
          },
          missingRequirements: [],
        }
      )
    } catch (error: any) {
      this.logger.error(`Failed to get perk eligibility details: ${error.message}`)
      return {
        isEligible: false,
        requirements: [],
        userHoldings: {
          tokenBalance: '0',
          lpBalance: '0',
          stakingBalance: '0',
        },
        missingRequirements: [],
      }
    }
  }

  async getContractStatus(): Promise<any> {
    this.logger.log('Getting contract status')

    try {
      const status = await this.perkManagerContract.getContractStatus()
      return {
        isActive: status.isActive || false,
        totalPerks: status.totalPerks || 0,
        totalBrands: status.totalBrands || 0,
        contractAddress: this.contractAddress,
      }
    } catch (error: any) {
      this.logger.error(`Failed to get contract status: ${error.message}`)
      return {
        isActive: false,
        totalPerks: 0,
        totalBrands: 0,
        contractAddress: this.contractAddress,
      }
    }
  }

  async clearCache(): Promise<void> {
    this.logger.log('Clearing all perk manager cache')
    await this.cacheManager.reset()
  }

  async clearPerkCaches(brandId: string): Promise<void> {
    this.logger.log(`Clearing perk caches for brand: ${brandId}`)

    // Clear brand-specific caches
    const keys = [
      `brand_perks_${brandId}`,
      `perk_details_${brandId}_*`,
      `nft_perk_config_${brandId}_*`,
    ]

    for (const key of keys) {
      await this.cacheManager.del(key)
    }
  }
}
