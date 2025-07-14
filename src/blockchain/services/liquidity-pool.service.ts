import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { BrandManagerService } from './brand-manager.service'

@Injectable()
export class LiquidityPoolService {
  private provider: ethers.AbstractProvider
  private lpManagerContract: ethers.Contract
  private readonly logger = new Logger(LiquidityPoolService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly brandManagerService: BrandManagerService,
  ) {
    // Initialize provider and contract
    const rpcURL =
      this.configService.get('blockchain.provider.rpcURL') ||
      this.configService.get('BLOCKCHAIN_PROVIDER_RPCURL') ||
      this.configService.getOrThrow('ETH_RPC_URL')

    // Use TRUSTED_ENTITY_KEY as fallback
    const trustedEntityKey =
      this.configService.get('blockchain.contract.trustedEntity.key') ||
      this.configService.getOrThrow('TRUSTED_ENTITY_KEY')

    // Get LP Manager address
    const lpManagerAddress =
      this.configService.get('blockchain.contract.lpManager.address') ||
      this.configService.getOrThrow('LP_MANAGER')

    this.provider = new ethers.JsonRpcProvider(rpcURL)
    const signer = new ethers.Wallet(trustedEntityKey, this.provider)

    // LP Manager ABI - minimal for creating and initializing pools
    const lpManagerABI = [
      'function createPool(uint256 brandId) external returns (address)',
      'function initializePool(uint256 brandId, uint256 tokenAmount, uint256 stableAmount) external payable',
      'function getPool(uint256 brandId) external view returns (address poolAddress, uint256 tokenReserve, uint256 stableReserve)',
      'function pools(uint256) external view returns (address)',
    ]

    this.lpManagerContract = new ethers.Contract(lpManagerAddress, lpManagerABI, signer)

    this.logger.log(`LiquidityPoolService initialized with LP Manager address: ${lpManagerAddress}`)
  }

  /**
   * Check if a user can create a liquidity pool for a brand
   * @param brandId The brand ID (UUID)
   * @param tokenAmount The amount of brand tokens to add to the pool
   * @param stableAmount The amount of stablecoin to add to the pool
   * @param walletAddress The wallet address to check
   * @returns Check result
   */
  async canCreateLiquidityPool(
    brandId: string,
    tokenAmount: string,
    stableAmount: string,
    walletAddress: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Checking if user ${walletAddress} can create a liquidity pool for brand ${brandId}`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Check if pool already exists
      try {
        const [poolAddress, ,] = await this.lpManagerContract.getPool(brandIdBN)
        if (poolAddress && poolAddress !== ethers.ZeroAddress) {
          this.logger.log(`Pool already exists for brand ${brandId} at address: ${poolAddress}`)
          return {
            canCreate: false,
            reason: 'Pool already exists',
            poolAddress,
          }
        }
      } catch (error) {
        this.logger.log(`No existing pool found for brand ${brandId}`)
      }

      // Get brand token address
      let brandTokenAddress
      try {
        const tokenInfo = await this.brandManagerService.getBrandTokenInfo(brandId)
        brandTokenAddress = tokenInfo.token

        if (!brandTokenAddress || brandTokenAddress === ethers.ZeroAddress) {
          return {
            canCreate: false,
            reason: 'Brand token not found',
          }
        }

        this.logger.log(`Brand token address: ${brandTokenAddress}`)
      } catch (error) {
        this.logger.error(`Error getting brand token address: ${error.message}`)
        return {
          canCreate: false,
          reason: `Failed to get brand token: ${error.message}`,
        }
      }

      // Get stablecoin address
      const stablecoinAddress =
        this.configService.get('blockchain.stablecoin') ||
        this.configService.getOrThrow('STABLECOIN_ADDRESS')

      // Create ERC20 token contract interfaces
      const erc20ABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function allowance(address owner, address spender) view returns (uint256)',
      ]

      // Check brand token balance
      const brandTokenContract = new ethers.Contract(brandTokenAddress, erc20ABI, this.provider)
      const tokenBalance = await brandTokenContract.balanceOf(walletAddress)
      const tokenAmountWei = ethers.parseEther(tokenAmount)

      if (tokenBalance < tokenAmountWei) {
        return {
          canCreate: false,
          reason: 'Insufficient brand token balance',
          tokenBalance: ethers.formatEther(tokenBalance),
          requiredTokenAmount: tokenAmount,
        }
      }

      // Check stablecoin balance
      const stablecoinContract = new ethers.Contract(stablecoinAddress, erc20ABI, this.provider)
      const stableBalance = await stablecoinContract.balanceOf(walletAddress)
      const stableAmountWei = ethers.parseEther(stableAmount)

      if (stableBalance < stableAmountWei) {
        return {
          canCreate: false,
          reason: 'Insufficient stablecoin balance',
          stableBalance: ethers.formatEther(stableBalance),
          requiredStableAmount: stableAmount,
        }
      }

      // Check brand token allowance
      const tokenAllowance = await brandTokenContract.allowance(
        walletAddress,
        this.lpManagerContract.target,
      )
      if (tokenAllowance < tokenAmountWei) {
        return {
          canCreate: false,
          reason: 'Insufficient brand token allowance',
          tokenAllowance: ethers.formatEther(tokenAllowance),
          requiredTokenAmount: tokenAmount,
        }
      }

      // Check stablecoin allowance
      const stableAllowance = await stablecoinContract.allowance(
        walletAddress,
        this.lpManagerContract.target,
      )
      if (stableAllowance < stableAmountWei) {
        return {
          canCreate: false,
          reason: 'Insufficient stablecoin allowance',
          stableAllowance: ethers.formatEther(stableAllowance),
          requiredStableAmount: stableAmount,
        }
      }

      // All checks passed
      return {
        canCreate: true,
        brandTokenAddress,
        stablecoinAddress,
        tokenBalance: ethers.formatEther(tokenBalance),
        stableBalance: ethers.formatEther(stableBalance),
        tokenAllowance: ethers.formatEther(tokenAllowance),
        stableAllowance: ethers.formatEther(stableAllowance),
      }
    } catch (error) {
      this.logger.error(
        `Error checking if user can create liquidity pool: ${error.message}`,
        error.stack,
      )
      return {
        canCreate: false,
        reason: `Error: ${error.message}`,
      }
    }
  }

  /**
   * Creates a liquidity pool for a brand and adds initial liquidity
   * @param brandId The brand ID (UUID)
   * @param tokenAmount The amount of brand tokens to add to the pool
   * @param stableAmount The amount of stablecoin to add to the pool
   * @param recipient The address to receive LP tokens (optional)
   * @returns Transaction details
   */
  async createLiquidityPool(
    brandId: string,
    tokenAmount: string,
    stableAmount: string,
    recipient?: string,
  ): Promise<any> {
    try {
      this.logger.log(`Creating liquidity pool for brand: ${brandId}`)

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Check if pool already exists
      try {
        const [poolAddress, ,] = await this.lpManagerContract.getPool(brandIdBN)
        if (poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000') {
          this.logger.log(`Pool already exists for brand ${brandId} at address: ${poolAddress}`)
          return {
            success: false,
            message: 'Pool already exists',
            poolAddress,
          }
        }
      } catch (error) {
        this.logger.log(`No existing pool found for brand ${brandId}, creating new pool`)
      }

      // Create the pool
      this.logger.log(`Creating pool for brand ${brandId}`)
      const createTransaction = await this.lpManagerContract.createPool(brandIdBN)
      const createReceipt = await createTransaction.wait()

      this.logger.log(`Pool created for brand ${brandId}, transaction hash: ${createReceipt.hash}`)

      // Get the pool address
      const [poolAddress, ,] = await this.lpManagerContract.getPool(brandIdBN)
      this.logger.log(`Pool address: ${poolAddress}`)

      if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Failed to create pool: pool address is null or zero address')
      }

      // Convert amounts to wei
      const tokenAmountWei = ethers.parseEther(tokenAmount)
      const stableAmountWei = ethers.parseEther(stableAmount)

      // Initialize the pool with liquidity
      this.logger.log(
        `Adding initial liquidity: ${tokenAmount} tokens and ${stableAmount} stablecoin`,
      )
      const initTransaction = await this.lpManagerContract.initializePool(
        brandIdBN,
        tokenAmountWei,
        stableAmountWei,
      )

      const initReceipt = await initTransaction.wait()
      this.logger.log(`Liquidity added, transaction hash: ${initReceipt.hash}`)

      return {
        success: true,
        poolAddress,
        createTransactionHash: createReceipt.hash,
        initTransactionHash: initReceipt.hash,
        brandId,
        tokenAmount,
        stableAmount,
        recipient: recipient || 'contract owner',
      }
    } catch (error) {
      this.logger.error(`Error creating liquidity pool: ${error.message}`, error.stack)
      throw new Error(`Failed to create liquidity pool: ${error.message}`)
    }
  }

  /**
   * Get liquidity pool information for a brand
   * @param brandId The brand ID (UUID)
   * @returns Pool information
   */
  async getLiquidityPoolInfo(brandId: string): Promise<any> {
    try {
      this.logger.log(`Getting liquidity pool info for brand: ${brandId}`)

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Get pool information
      const [poolAddress, tokenReserve, stableReserve] =
        await this.lpManagerContract.getPool(brandIdBN)

      if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
        return {
          success: false,
          message: 'No liquidity pool found for this brand',
          brandId,
        }
      }

      return {
        success: true,
        poolAddress,
        tokenReserve: ethers.formatEther(tokenReserve),
        stableReserve: ethers.formatEther(stableReserve),
        brandId,
      }
    } catch (error) {
      this.logger.error(`Error getting liquidity pool info: ${error.message}`, error.stack)
      throw new Error(`Failed to get liquidity pool info: ${error.message}`)
    }
  }

  /**
   * Convert UUID to BigNumber for smart contract
   * @param uuid The UUID to convert
   * @returns The UUID as a BigNumber
   */
  private uuidToBigNumber(uuid: string): ethers.BigNumberish {
    // Remove hyphens and convert to hex
    const hexString = '0x' + uuid.replace(/-/g, '')

    // Convert to BigNumber
    return ethers.getBigInt(hexString)
  }
}
