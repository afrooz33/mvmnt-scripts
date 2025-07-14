import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { BrandManagerService } from './brand-manager.service'

@Injectable()
export class StableTokenService {
  private provider: ethers.Provider
  private readonly logger = new Logger(StableTokenService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly brandManagerService: BrandManagerService,
  ) {
    // Initialize provider
    const rpcURL =
      this.configService.get('blockchain.provider.rpcURL') ||
      this.configService.get('BLOCKCHAIN_PROVIDER_RPCURL') ||
      this.configService.getOrThrow('ETH_RPC_URL')

    this.provider = new ethers.JsonRpcProvider(rpcURL)

    this.logger.log(`StableTokenService initialized with RPC URL: ${rpcURL}`)
  }

  /**
   * Create a new stable token using the BrandManager contract
   * @param name The name of the stable token
   * @param symbol The symbol of the stable token
   * @param creatorAddress The address that will be set as the token creator
   * @returns The address of the newly created stable token
   */
  async createStableToken(name: string, symbol: string, creatorAddress: string): Promise<string> {
    try {
      this.logger.log(`Creating stable token with name: ${name}, symbol: ${symbol}`)

      // Generate a numeric ID for the stable token instead of UUID
      // The smart contract expects a numeric value that can be converted to BigNumber
      const timestamp = Date.now()
      const randomNum = Math.floor(Math.random() * 1000000)
      const stableTokenId = `${timestamp}${randomNum}`

      // Use the BrandManagerService to create the token
      const tokenAddress = await this.brandManagerService.createToken(
        stableTokenId,
        name,
        symbol,
        creatorAddress,
      )

      this.logger.log(`Stable token created successfully at address: ${tokenAddress}`)

      return tokenAddress
    } catch (error) {
      this.logger.error(`Error creating stable token: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Get information about a stable token
   * @param tokenAddress The address of the stable token
   * @returns Token information including name, symbol, decimals, and total supply
   */
  async getStableTokenInfo(tokenAddress: string): Promise<any> {
    try {
      this.logger.log(`Getting information for stable token at address: ${tokenAddress}`)
      return await this.brandManagerService.getTokenInfoByAddress(tokenAddress)
    } catch (error) {
      this.logger.error(`Error getting stable token info: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Generate a UUID v4
   * @returns A UUID v4 string
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
