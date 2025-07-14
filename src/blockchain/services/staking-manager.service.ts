import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { StakingManagerABI } from '../abi'
import BigNumber from 'bignumber.js'
import { BrandManagerService } from './brand-manager.service'

@Injectable()
export class StakingManagerService {
  private provider: ethers.AbstractProvider
  private StakingManagerContract: ethers.Contract

  constructor(
    private readonly configService: ConfigService,
    private readonly brandManagerService: BrandManagerService,
  ) {
    // Initialize provider and contract
    const rpcURL = this.configService.getOrThrow('blockchain.provider.rpcURL')
    const trustedEntityKey = this.configService.getOrThrow('TRUSTED_ENTITY_KEY')
    const StakingManagerAddress = this.configService.get('STAKING_MANAGER_CONTRACT_ADDRESS')

    this.provider = new ethers.JsonRpcProvider(rpcURL)
    const signer = new ethers.Wallet(trustedEntityKey, this.provider)
    this.StakingManagerContract = new ethers.Contract(
      StakingManagerAddress,
      StakingManagerABI,
      signer,
    )

    console.log(`StakingManager contract initialized with address: ${StakingManagerAddress}`)
  }

  /**
   * Sets staking configuration for a brand
   * @param brandId The brand ID (UUID)
   * @param baseRewardRate Base annual reward rate (scaled by 1e18)
   * @param bonusRewardRate Additional reward rate for longer staking (scaled by 1e18)
   * @param maxLockPeriod Maximum lock period (in seconds)
   * @param minStakeAmount Minimum stake amount
   * @returns Transaction hash
   */
  async setStakingConfig(
    brandId: string,
    baseRewardRate: string,
    bonusRewardRate: string,
    maxLockPeriod: number,
    minStakeAmount: string,
  ): Promise<string> {
    try {
      console.log(`[StakingManagerService] Setting staking config for brandId: ${brandId}`)

      // Check contract ownership first
      const ownership = await this.checkContractOwnership()
      if (!ownership.isOwner) {
        console.error(
          `[StakingManagerService] Permission error: Current signer ${ownership.currentSigner} is not the contract owner ${ownership.owner}`,
        )
        throw new Error(
          `Permission denied: Current signer is not the contract owner. Please use the owner account.`,
        )
      }

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Convert string amounts to ethers BigNumber
      // These values are already in wei format (with 18 decimals), so we use them directly
      const baseRewardRateBN = ethers.getBigInt(baseRewardRate)
      const bonusRewardRateBN = ethers.getBigInt(bonusRewardRate)
      const minStakeAmountBN = ethers.getBigInt(minStakeAmount)

      console.log(`[StakingManagerService] Calling setStakingConfig with params:
        brandId: ${brandIdBN.toString()}
        baseRewardRate: ${baseRewardRateBN.toString()}
        bonusRewardRate: ${bonusRewardRateBN.toString()}
        maxLockPeriod: ${maxLockPeriod}
        minStakeAmount: ${minStakeAmountBN.toString()}`)

      // Check if the signer has the right permissions
      const signer = this.StakingManagerContract.runner as ethers.Wallet
      const signerAddress = await signer.getAddress()
      console.log(`[StakingManagerService] Signer address: ${signerAddress}`)

      // Try to check if the contract has an owner or admin role
      try {
        // Common owner/admin function names in contracts
        const possibleOwnerFunctions = ['owner', 'getOwner', 'admin', 'getAdmin', 'hasRole']

        for (const funcName of possibleOwnerFunctions) {
          if (typeof this.StakingManagerContract[funcName] === 'function') {
            try {
              const result = await this.StakingManagerContract[funcName]()
              console.log(`[StakingManagerService] ${funcName} result: ${result}`)
            } catch (e) {
              // Ignore errors for functions that don't exist
            }
          }
        }
      } catch (e) {
        console.log('[StakingManagerService] Could not check owner/admin functions')
      }

      // Call the setStakingConfig function
      const transaction = await this.StakingManagerContract.setStakingConfig(
        brandIdBN,
        baseRewardRateBN,
        bonusRewardRateBN,
        maxLockPeriod,
        minStakeAmountBN,
      )

      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)

      // Wait for transaction to be mined
      const receipt = await transaction.wait()

      console.log(
        `[StakingManagerService] Transaction mined in block ${receipt.blockNumber}, hash: ${receipt.hash}`,
      )

      // Return transaction hash
      return receipt.hash
    } catch (error) {
      console.error('[StakingManagerService] Error setting staking config:', error)

      // Try to decode the error
      if (error.data) {
        console.error(`[StakingManagerService] Error data: ${error.data}`)

        // Check for common error signatures
        if (error.data.startsWith('0x08c379a0')) {
          // This is a standard error string
          try {
            const errorData = `0x${error.data.substring(10)}`
            const decoded = new ethers.AbiCoder().decode(['string'], errorData)
            console.error(`[StakingManagerService] Decoded error: ${decoded[0]}`)
          } catch (e) {
            console.error('[StakingManagerService] Could not decode error data')
          }
        }
      }

      // Check if it's a permission issue
      if (error.message && error.message.includes('execution reverted')) {
        console.error(
          '[StakingManagerService] This might be a permission issue. Check if the signer has the right role.',
        )

        // Try to get contract info
        try {
          const contractCode = await this.provider.getCode(this.StakingManagerContract.target)
          console.log(`[StakingManagerService] Contract code exists: ${contractCode.length > 2}`)
        } catch (e) {
          console.error('[StakingManagerService] Error checking contract code:', e)
        }
      }

      throw error
    }
  }

  /**
   * Stake brand tokens
   * @param brandId The brand ID (UUID)
   * @param amount The amount to stake
   * @param lockPeriodSeconds The lock period in seconds
   * @param userAddress The user's wallet address
   * @returns Transaction result
   */
  async stakeBrandToken(
    brandId: string,
    amount: string,
    lockPeriodSeconds: number,
    userAddress: string,
  ): Promise<any> {
    try {
      console.log(
        `[StakingManagerService] Staking brand tokens for brand ${brandId}, amount: ${amount}, lock period: ${lockPeriodSeconds} seconds`,
      )

      // Check if staking is paused
      const stakingConfig = await this.StakingManagerContract.stakingConfigs(
        this.uuidToBigNumber(brandId),
      )
      if (stakingConfig[4]) {
        // paused flag
        throw new Error('Staking is paused')
      }

      // Check if amount is below minimum
      const minStakeAmount = stakingConfig[3]
      if (ethers.parseEther(amount) < minStakeAmount) {
        throw new Error('Amount below minimum')
      }

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Convert amount to wei
      const amountWei = ethers.parseEther(amount)

      // Call the stakeBrandToken function
      const transaction = await this.StakingManagerContract.stakeBrandToken(
        brandIdBN,
        amountWei,
        lockPeriodSeconds,
      )

      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)
      const receipt = await transaction.wait()

      return {
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        brandId,
        amount,
        userAddress,
        lockPeriodSeconds,
      }
    } catch (error) {
      console.error('[StakingManagerService] Error staking brand tokens:', error)
      throw error
    }
  }

  /**
   * Unstake tokens
   * @param brandId The brand ID (UUID)
   * @param stakeId The stake ID
   * @returns Transaction result
   */
  async unstake(brandId: string, stakeId: number): Promise<any> {
    try {
      console.log(
        `[StakingManagerService] Unstaking tokens for brand ${brandId}, stake ID: ${stakeId}`,
      )

      // Get user stakes to validate
      const signer = this.StakingManagerContract.runner as ethers.Wallet
      const signerAddress = await signer.getAddress()
      const stakes = await this.StakingManagerContract.getUserStakes(
        this.uuidToBigNumber(brandId),
        signerAddress,
      )
      const stake = stakes.find((s: any) => s.stakeId === stakeId)

      if (!stake) {
        throw new Error('Stake not found')
      }

      if (!stake.active) {
        throw new Error('Stake is already inactive')
      }

      // Call the unstake function
      const transaction = await this.StakingManagerContract.unstake(
        this.uuidToBigNumber(brandId),
        stakeId,
      )
      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)

      const receipt = await transaction.wait()

      return {
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        brandId,
        stakeId,
      }
    } catch (error) {
      console.error('[StakingManagerService] Error unstaking tokens:', error)
      throw error
    }
  }

  /**
   * Get total user stake amount
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Total staked amount
   */
  async getTotalUserStake(brandId: string, userAddress: string): Promise<string> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Get total user stake
      const totalStake = await this.StakingManagerContract.getTotalUserStake(brandIdBN, userAddress)

      return ethers.formatEther(totalStake)
    } catch (error) {
      console.error('[StakingManagerService] Error getting total user stake:', error)
      throw error
    }
  }

  /**
   * Get total user LP stake amount
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Total LP staked amount
   */
  async getTotalUserLPStake(brandId: string, userAddress: string): Promise<string> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Get total user LP stake
      const stakes = await this.StakingManagerContract.getUserStakes(brandIdBN, userAddress)

      // Filter and sum LP stakes
      const totalLPStake = stakes
        .filter((stake: any) => stake.isLPToken && stake.active)
        .reduce((total: bigint, stake: any) => total + BigInt(stake.amount), BigInt(0))

      return ethers.formatEther(totalLPStake)
    } catch (error) {
      console.error('[StakingManagerService] Error getting total user LP stake:', error)
      throw error
    }
  }

  /**
   * Update APY for a brand
   * @param brandId The brand ID (UUID)
   * @returns Transaction result
   */
  async updateAPY(brandId: string): Promise<any> {
    try {
      console.log(`[StakingManagerService] Updating APY for brand ${brandId}`)

      // Check contract ownership first
      const ownership = await this.checkContractOwnership()
      if (!ownership.isOwner) {
        throw new Error('Permission denied')
      }

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the updateAPY function
      const transaction = await this.StakingManagerContract.updateAPY(brandIdBN)
      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)

      const receipt = await transaction.wait()

      return {
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        brandId,
      }
    } catch (error) {
      console.error('[StakingManagerService] Error updating APY:', error)
      throw error
    }
  }

  /**
   * Pause staking for a brand
   * @param brandId The brand ID (UUID)
   * @returns Transaction result
   */
  async pauseBrandStaking(brandId: string): Promise<any> {
    try {
      console.log(`[StakingManagerService] Pausing staking for brand ${brandId}`)

      // Check contract ownership first
      const ownership = await this.checkContractOwnership()
      if (!ownership.isOwner) {
        throw new Error('Permission denied')
      }

      // Check if staking is already paused
      const stakingConfig = await this.StakingManagerContract.stakingConfigs(
        this.uuidToBigNumber(brandId),
      )
      if (stakingConfig[4]) {
        // paused flag
        throw new Error('Staking is already paused')
      }

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the pauseBrandStaking function
      const transaction = await this.StakingManagerContract.pauseBrandStaking(brandIdBN)
      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)

      const receipt = await transaction.wait()

      return {
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        brandId,
      }
    } catch (error) {
      console.error('[StakingManagerService] Error pausing brand staking:', error)
      throw error
    }
  }

  /**
   * Unpause staking for a brand
   * @param brandId The brand ID (UUID)
   * @returns Transaction result
   */
  async unpauseBrandStaking(brandId: string): Promise<any> {
    try {
      console.log(`[StakingManagerService] Unpausing staking for brand ${brandId}`)

      // Check contract ownership first
      const ownership = await this.checkContractOwnership()
      if (!ownership.isOwner) {
        throw new Error('Permission denied')
      }

      // Check if staking is not paused
      const stakingConfig = await this.StakingManagerContract.stakingConfigs(
        this.uuidToBigNumber(brandId),
      )
      if (!stakingConfig[4]) {
        // paused flag
        throw new Error('Staking is not paused')
      }

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the unpauseBrandStaking function
      const transaction = await this.StakingManagerContract.unpauseBrandStaking(brandIdBN)
      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)

      const receipt = await transaction.wait()

      return {
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        brandId,
      }
    } catch (error) {
      console.error('[StakingManagerService] Error unpausing brand staking:', error)
      throw error
    }
  }

  /**
   * Get user's staked amount
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Staked amount as BigNumber
   */

  async getStakedAmount(brandId: string, userAddress: string): Promise<BigNumber> {
    try {
      console.log(
        `[StakingManagerService] Getting staked amount for brandId: ${brandId}, userAddress: ${userAddress}`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)
      console.log(`[StakingManagerService] Converted brandId to BigNumber: ${brandIdBN.toString()}`)

      // Check if the contract has the function
      if (typeof this.StakingManagerContract.stakedAmount !== 'function') {
        console.log(
          `[StakingManagerService] stakedAmount function not found, checking alternative functions`,
        )

        // Try alternative function names
        const possibleFunctions = [
          'stakedAmount',
          'getStakedAmount',
          'userStakedAmount',
          'getUserStakedAmount',
        ]
        let stakedAmount

        for (const funcName of possibleFunctions) {
          if (typeof this.StakingManagerContract[funcName] === 'function') {
            console.log(`[StakingManagerService] Found function: ${funcName}`)
            try {
              stakedAmount = await this.StakingManagerContract[funcName](brandIdBN, userAddress)
              console.log(`[StakingManagerService] Successfully called ${funcName}`)
              break
            } catch (e) {
              console.log(`[StakingManagerService] Error calling ${funcName}: ${e.message}`)
            }
          }
        }

        if (!stakedAmount) {
          // If no function works, try to get the information from user stakes
          console.log(`[StakingManagerService] Trying to get staked amount from getUserStakes`)
          const stakes = await this.getUserStakes(brandId, userAddress)

          // Sum up all active stakes
          stakedAmount = stakes.reduce((total, stake) => {
            if (stake.active) {
              return total.plus(new BigNumber(stake.amount))
            }
            return total
          }, new BigNumber(0))
        }

        return stakedAmount || new BigNumber(0)
      }

      // Call the stakedAmount function
      const stakedAmount = await this.StakingManagerContract.stakedAmount(brandIdBN, userAddress)
      console.log(`[StakingManagerService] Staked amount: ${stakedAmount.toString()}`)

      // Convert to BigNumber
      return new BigNumber(this.formatEther(stakedAmount))
    } catch (error) {
      console.error('[StakingManagerService] Error getting staked amount:', error)
      // Return 0 on error to avoid breaking the UI
      return new BigNumber(0)
    }
  }

  /**
   * Get pending rewards
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Pending rewards as BigNumber
   */
  async getPendingRewards(brandId: string, userAddress: string): Promise<BigNumber> {
    try {
      console.log(
        `[StakingManagerService] Getting pending rewards for brandId: ${brandId}, userAddress: ${userAddress}`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)
      console.log(`[StakingManagerService] Converted brandId to BigNumber: ${brandIdBN.toString()}`)

      // Check if the contract has the function
      if (typeof this.StakingManagerContract.pendingRewards !== 'function') {
        console.log(
          `[StakingManagerService] pendingRewards function not found, checking alternative functions`,
        )

        // Try alternative function names
        const possibleFunctions = [
          'pendingRewards',
          'getPendingRewards',
          'calculateRewards',
          'getRewards',
        ]
        let pendingRewards

        for (const funcName of possibleFunctions) {
          if (typeof this.StakingManagerContract[funcName] === 'function') {
            console.log(`[StakingManagerService] Found function: ${funcName}`)
            try {
              pendingRewards = await this.StakingManagerContract[funcName](brandIdBN, userAddress)
              console.log(`[StakingManagerService] Successfully called ${funcName}`)
              break
            } catch (e) {
              console.log(`[StakingManagerService] Error calling ${funcName}: ${e.message}`)
            }
          }
        }

        return pendingRewards ? new BigNumber(this.formatEther(pendingRewards)) : new BigNumber(0)
      }

      // Call the pendingRewards function
      const pendingRewards = await this.StakingManagerContract.pendingRewards(
        brandIdBN,
        userAddress,
      )
      console.log(`[StakingManagerService] Pending rewards: ${pendingRewards.toString()}`)

      // Convert to BigNumber
      return new BigNumber(this.formatEther(pendingRewards))
    } catch (error) {
      console.error('[StakingManagerService] Error getting pending rewards:', error)
      // Return 0 on error to avoid breaking the UI
      return new BigNumber(0)
    }
  }

  /**
   * Claim rewards
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Transaction hash
   */
  async claimRewards(brandId: string, userAddress: string): Promise<string> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the claimRewards function
      const transaction = await this.StakingManagerContract.claimRewards(brandIdBN, userAddress)

      // Wait for transaction to be mined
      const receipt = await transaction.wait()

      // Return transaction hash
      return receipt.hash
    } catch (error) {
      console.error('Error claiming rewards:', error)
      throw error
    }
  }

  /**
   * Get brand ID from token address
   * @param tokenAddress The token address
   * @returns The brand ID
   */
  private async getBrandIdFromToken(tokenAddress: string): Promise<ethers.BigNumberish> {
    try {
      // Get BTManager address from contract
      const btManagerAddress = await this.StakingManagerContract.btManager()

      // Create BTManager contract instance
      const btManagerABI = ['function tokenBrands(address) view returns (uint256)']

      const btManagerContract = new ethers.Contract(btManagerAddress, btManagerABI, this.provider)

      // Get brand ID from token address
      const brandId = await btManagerContract.tokenBrands(tokenAddress)
      return brandId
    } catch (error) {
      console.error(`[StakingManagerService] Error getting brand ID from token: ${error.message}`)
      throw new Error(`Failed to get brand ID from token: ${error.message}`)
    }
  }

  /**
   * Get current APY for staking
   * @param brandIdOrToken The brand ID (UUID) or token address
   * @returns Current APY as percentage (e.g., 5.2 for 5.2%)
   */
  async getCurrentAPY(brandIdOrToken: string): Promise<{
    btAPY: number
    lpAPY: number
    tradingVolume: string
    tvl: string
  }> {
    try {
      console.log(`[StakingManagerService] Getting current APY for brand/token: ${brandIdOrToken}`)

      // Convert input to brand ID
      let brandIdBN: ethers.BigNumberish
      if (brandIdOrToken.startsWith('0x')) {
        // Input is a token address
        brandIdBN = await this.getBrandIdFromToken(brandIdOrToken)
      } else {
        // Input is a UUID
        brandIdBN = this.uuidToBigNumber(brandIdOrToken)
      }

      console.log(`[StakingManagerService] Converted to brand ID: ${brandIdBN.toString()}`)

      // Check if brand is configured for staking
      console.log(`[StakingManagerService] Checking if brand is configured for staking...`)
      const stakingConfig = await this.StakingManagerContract.stakingConfigs(brandIdBN)
      console.log(`[StakingManagerService] Staking config:`, stakingConfig)

      if (!stakingConfig || stakingConfig.baseRewardRate.toString() === '0') {
        console.log(`[StakingManagerService] Brand is not configured for staking`)
        throw new Error('Brand is not configured for staking')
      }

      // Get current APY data from the contract
      console.log(`[StakingManagerService] Calling getCurrentAPY on contract...`)
      const result = await this.StakingManagerContract.getCurrentAPY(brandIdBN)
      console.log(`[StakingManagerService] Contract response:`, result)

      const [btAPY, lpAPY, tradingVolume, tvl] = result
      console.log(`[StakingManagerService] Destructured values:
        btAPY: ${btAPY} (type: ${typeof btAPY})
        lpAPY: ${lpAPY} (type: ${typeof lpAPY})
        tradingVolume: ${tradingVolume} (type: ${typeof tradingVolume})
        tvl: ${tvl} (type: ${typeof tvl})`)

      // Convert APY values to numbers, handling different possible formats
      const convertToNumber = (value: any): number => {
        console.log(`[StakingManagerService] Converting value to number:`, value)
        if (typeof value === 'number') {
          console.log(`[StakingManagerService] Value is already a number`)
          return value / 100
        }
        if (typeof value?.toNumber === 'function') {
          console.log(`[StakingManagerService] Value has toNumber function`)
          return value.toNumber() / 100
        }
        if (typeof value === 'string' || typeof value === 'bigint') {
          console.log(`[StakingManagerService] Value is string or bigint`)
          return Number(value) / 100
        }
        console.log(`[StakingManagerService] Could not convert value, returning 0`)
        return 0
      }

      const response = {
        btAPY: convertToNumber(btAPY), // Convert basis points to percentage
        lpAPY: convertToNumber(lpAPY), // Convert basis points to percentage
        tradingVolume: tradingVolume.toString(),
        tvl: tvl.toString(),
      }

      console.log(`[StakingManagerService] Final response:`, response)
      return response
    } catch (error) {
      console.error(
        `[StakingManagerService] Error getting current APY for brand/token ${brandIdOrToken}:`,
        error,
      )
      throw new Error(`Failed to get current APY: ${error.message}`)
    }
  }

  /**
   * Get the current APY for a brand token as a string
   * @param brandId The brand ID (UUID)
   * @returns The current APY as a percentage string
   */
  async getBrandTokenAPY(brandId: string): Promise<string> {
    try {
      const apy = await this.getCurrentAPY(brandId)
      return apy.btAPY.toFixed(2)
    } catch (error) {
      console.error('[StakingManagerService] Error getting brand token APY:', error)
      throw error
    }
  }

  /**
   * Get staking configuration for a brand token
   * @param brandId The brand ID (UUID)
   * @returns The staking configuration
   */
  async getStakingConfig(brandId: string): Promise<any> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the stakingConfigs function
      const config = await this.StakingManagerContract.stakingConfigs(brandIdBN)

      return {
        baseRewardRate: this.formatEther(config[0]),
        bonusRewardRate: this.formatEther(config[1]),
        maxLockPeriod: Number(config[2]),
        minStakeAmount: this.formatEther(config[3]),
        paused: config[4],
      }
    } catch (error) {
      console.error('[StakingManagerService] Error getting staking config:', error)
      throw error
    }
  }

  /**
   * Get total staked amount for a brand token
   * @param brandId The brand ID (UUID)
   * @returns The total staked amount
   */
  async getTotalStaked(brandId: string): Promise<string> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the getTotalStaked function
      const totalStaked = await this.StakingManagerContract.getTotalStaked(brandIdBN)

      return this.formatEther(totalStaked)
    } catch (error) {
      console.error('[StakingManagerService] Error getting total staked:', error)
      throw error
    }
  }

  /**
   * Get all stakes for a user
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Array of stakes
   */
  async getUserStakes(brandId: string, userAddress: string): Promise<any[]> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the getUserStakes function
      const stakes = await this.StakingManagerContract.getUserStakes(brandIdBN, userAddress)

      // Format the stakes and assign stake IDs based on array index
      return stakes.map((stake: any, index: number) => ({
        stakeId: index, // Use array index as stake ID
        amount: this.formatEther(stake.amount),
        startTime: Number(stake.startTime),
        lockPeriod: Number(stake.lockPeriod),
        lastClaimTime: Number(stake.lastClaimTime),
        active: stake.active,
      }))
    } catch (error) {
      console.error('[StakingManagerService] Error getting user stakes:', error)
      throw error
    }
  }

  /**
   * Check contract relationship with BTManager
   * @returns Contract relationship status
   */
  async checkContractRelationship(): Promise<any> {
    try {
      const btManagerAddress = await this.StakingManagerContract.btManager()

      return {
        btManagerAddress,
        isCorrect: true, // Placeholder, would need to compare with expected address
      }
    } catch (error) {
      console.error('[StakingManagerService] Error checking contract relationship:', error)
      throw error
    }
  }

  /**
   * Convert UUID to BigNumber for smart contract
   * @param uuid The UUID to convert
   * @returns The UUID as a BigNumber
   */
  private uuidToBigNumber(uuid: string): ethers.BigNumberish {
    // If it's already a hex address starting with 0x, use it directly
    if (uuid.startsWith('0x')) {
      return ethers.toBigInt(uuid)
    }

    // Otherwise treat it as UUID - remove hyphens and add 0x prefix
    const hexString = '0x' + uuid.replace(/-/g, '')
    return ethers.toBigInt(hexString)
  }

  /**
   * Format ethers BigNumber to string
   * @param value The value to format
   * @returns The formatted value
   */
  private formatEther(value: bigint): string {
    return ethers.formatEther(value)
  }

  /**
   * Parse string to ethers BigNumber
   * @param value The value to parse
   * @returns The parsed value
   */
  private parseEther(value: string): bigint {
    return ethers.parseEther(value)
  }

  /**
   * Check if the current signer is the contract owner
   * @returns Ownership status
   */
  async checkContractOwnership(): Promise<{
    isOwner: boolean
    owner: string
    currentSigner: string
  }> {
    try {
      const signer = this.StakingManagerContract.runner as ethers.Wallet
      const signerAddress = await signer.getAddress()

      // Check if contract has owner function
      const ownerAddress = await this.StakingManagerContract.owner()

      // Check if signer is owner
      const isOwner = signerAddress.toLowerCase() === ownerAddress.toLowerCase()

      return { isOwner, owner: ownerAddress, currentSigner: signerAddress }
    } catch (error) {
      console.error('[StakingManagerService] Error checking contract ownership:', error)
      return { isOwner: false, owner: 'unknown', currentSigner: 'unknown' }
    }
  }

  /**
   * Check if a user can stake tokens
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @param amount The amount to stake
   * @returns Object with canStake flag, reason if can't stake, and user's balance
   */
  async canUserStake(
    brandId: string,
    userAddress: string,
    amount: string,
  ): Promise<{
    canStake: boolean
    reason?: string
    balance?: string
    allowance?: string
    minStakeAmount?: string
  }> {
    try {
      console.log(
        `[StakingManagerService] Checking if user ${userAddress} can stake ${amount} for brand ${brandId}`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)
      console.log(`[StakingManagerService] Converted brandId ${brandId} to BigNumber: ${brandIdBN}`)

      // Get staking config
      const stakingConfig = await this.StakingManagerContract.stakingConfigs(brandIdBN)
      console.log(`[StakingManagerService] Got staking config:`, stakingConfig)

      // Check if staking is paused
      if (stakingConfig[4]) {
        // paused flag
        return {
          canStake: false,
          reason: 'Staking is paused',
        }
      }

      // Check minimum stake amount
      const minStakeAmount = stakingConfig[3]
      const amountWei = ethers.parseEther(amount)
      if (amountWei < minStakeAmount) {
        return {
          canStake: false,
          reason: 'Amount below minimum',
          minStakeAmount: ethers.formatEther(minStakeAmount),
        }
      }

      // Get BTManager address from contract
      const btManagerAddress = await this.StakingManagerContract.btManager()

      // Create BTManager contract instance
      const btManagerABI = ['function brandTokens(uint256) view returns (address)']

      const btManagerContract = new ethers.Contract(btManagerAddress, btManagerABI, this.provider)

      // Get token address from BTManager
      const tokenAddress = await btManagerContract.brandTokens(brandIdBN)

      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        return {
          canStake: false,
          reason: 'Token not found',
        }
      }

      // Check user balance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function allowance(address,address) view returns (uint256)',
        ],
        this.provider,
      )

      const balance = await tokenContract.balanceOf(userAddress)
      if (balance < amountWei) {
        return {
          canStake: false,
          reason: 'Insufficient balance',
          balance: ethers.formatEther(balance),
        }
      }

      // Check allowance
      const allowance = await tokenContract.allowance(
        userAddress,
        this.StakingManagerContract.target,
      )
      if (allowance < amountWei) {
        return {
          canStake: false,
          reason: 'Insufficient allowance',
          allowance: ethers.formatEther(allowance),
        }
      }

      return {
        canStake: true,
        balance: ethers.formatEther(balance),
        allowance: ethers.formatEther(allowance),
        minStakeAmount: ethers.formatEther(minStakeAmount),
      }
    } catch (error) {
      console.error(`[StakingManagerService] Error checking if user can stake: ${error.message}`)
      return {
        canStake: false,
        reason: `Failed to check staking eligibility: ${error.message}`,
      }
    }
  }

  /**
   * Get token information for a brand
   * @param brandId The brand ID (UUID)
   * @returns Token information
   */
  async getTokenInfo(brandId: string): Promise<any> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // This is a workaround since we don't have direct access to the token info endpoint
      // In a real implementation, you would make an HTTP call to your API endpoint
      // or use the correct contract method

      // Try to get the token address from the contract using various methods
      let tokenAddress
      try {
        // Try to get token info from the contract
        // You might need to check the actual function name in your contract
        const tokenInfo = await this.StakingManagerContract.getBrandTokenAddress(brandIdBN)
        tokenAddress = tokenInfo
      } catch (contractError) {
        console.error(
          `[StakingManagerService] Error getting token address from contract: ${contractError.message}`,
        )

        // If contract call fails, try to get the token from the brand token stats
        try {
          // This is assuming you have a method to get brand token stats
          // that includes the token address
          const stats = await this.getBrandTokenStats(brandId)
          tokenAddress = stats.tokenAddress
        } catch (statsError) {
          console.error(
            `[StakingManagerService] Error getting token address from stats: ${statsError.message}`,
          )

          // If all else fails, use a hardcoded value for testing
          // THIS SHOULD BE REMOVED IN PRODUCTION
          console.warn('[StakingManagerService] Using fallback token address for testing')
          tokenAddress = '0x34eFb68A1B96B7B3F1309789863F27FD8dFD028C'
        }
      }

      return {
        brandId,
        tokenAddress,
        tokenName: 'TestToken', // This should come from the contract or API
        tokenSymbol: 'TT', // This should come from the contract or API
      }
    } catch (error) {
      console.error(`[StakingManagerService] Error in getTokenInfo: ${error.message}`)
      throw error
    }
  }

  /**
   * Get brand token stats
   * @param brandId The brand ID (UUID)
   * @returns Brand token stats
   */
  async getBrandTokenStats(_brandId: string): Promise<any> {
    try {
      // This is a placeholder - in a real implementation, you would
      // make an HTTP call to your API endpoint or use the correct contract method
      throw new Error('Not implemented')
    } catch (error) {
      console.error(`[StakingManagerService] Error in getBrandTokenStats: ${error.message}`)
      throw error
    }
  }

  /**
   * Get the StakingManager contract address
   * @returns The contract address
   */
  getContractAddress(): string {
    return String(this.StakingManagerContract.target)
  }

  /**
   * Stake LP tokens for a brand
   * @param brandId The brand ID (UUID)
   * @param amount The amount of LP tokens to stake
   * @param lockPeriodDays The lock period in days
   * @param userAddress The address of the user staking the tokens
   * @returns The transaction receipt
   */
  async stakeLPToken(
    brandId: string,
    amount: string,
    lockPeriodDays: number,
    userAddress: string,
  ): Promise<any> {
    try {
      console.log(`[StakingManagerService] Starting stakeLPToken with params:
        brandId: ${brandId}
        amount: ${amount}
        lockPeriodDays: ${lockPeriodDays}
        userAddress: ${userAddress}`)

      // Check if user can stake LP tokens
      console.log(`[StakingManagerService] Checking if user can stake LP tokens...`)
      const canStake = await this.canUserStakeLP(brandId, userAddress, amount)
      console.log(`[StakingManagerService] Can stake check result:`, canStake)

      if (!canStake.canStake) {
        console.error(`[StakingManagerService] Cannot stake LP tokens: ${canStake.reason}`)
        throw new Error(canStake.reason || 'Cannot stake LP tokens')
      }

      // Validate lock period
      if (lockPeriodDays <= 0) {
        console.error(`[StakingManagerService] Invalid lock period: ${lockPeriodDays} days`)
        throw new Error('Invalid lock period')
      }

      // Get staking config to validate parameters
      const brandIdBN = this.uuidToBigNumber(brandId)
      console.log(`[StakingManagerService] Converted brandId to BigNumber: ${brandIdBN.toString()}`)

      const stakingConfig = await this.StakingManagerContract.stakingConfigs(brandIdBN)
      console.log(`[StakingManagerService] Retrieved staking config:`, {
        baseRewardRate: stakingConfig[0].toString(),
        bonusRewardRate: stakingConfig[1].toString(),
        maxLockPeriod: stakingConfig[2].toString(),
        minStakeAmount: stakingConfig[3].toString(),
        paused: stakingConfig[4],
      })

      // Check if staking is paused
      if (stakingConfig[4]) {
        console.error(`[StakingManagerService] Staking is paused for brand ${brandId}`)
        throw new Error('Staking is currently paused for this brand')
      }

      // Validate minimum stake amount
      const minStakeAmount = stakingConfig[3]
      const amountWei = ethers.parseEther(amount)
      console.log(`[StakingManagerService] Amount validation:
        Amount in wei: ${amountWei.toString()}
        Minimum stake amount: ${minStakeAmount.toString()}`)

      if (amountWei < minStakeAmount) {
        console.error(
          `[StakingManagerService] Amount ${amount} is below minimum stake amount ${ethers.formatEther(
            minStakeAmount,
          )}`,
        )
        throw new Error(
          `Amount below minimum stake amount of ${ethers.formatEther(minStakeAmount)}`,
        )
      }

      // Get LP token address
      console.log(`[StakingManagerService] Getting LP token address for brand ${brandId}...`)
      const lpTokenAddress = await this.brandManagerService.getLPTokenAddress(brandId)
      console.log(`[StakingManagerService] LP token address: ${lpTokenAddress}`)

      if (!lpTokenAddress) {
        console.error(`[StakingManagerService] LP token not found for brand ${brandId}`)
        throw new Error('LP token not found')
      }

      // Create a new contract instance with the user's signer
      const trustedEntityKey = this.configService.getOrThrow('TRUSTED_ENTITY_KEY')
      const signer = new ethers.Wallet(trustedEntityKey, this.provider)
      console.log(`[StakingManagerService] Created signer with address: ${signer.address}`)

      const stakingManagerWithSigner = new ethers.Contract(
        this.StakingManagerContract.target,
        this.StakingManagerContract.interface,
        signer,
      )
      console.log(`[StakingManagerService] Created StakingManager contract instance with signer`)

      // Convert lock period to seconds
      const SECONDS_IN_DAY = 24 * 60 * 60
      const lockPeriodSeconds = BigInt(lockPeriodDays * SECONDS_IN_DAY)
      console.log(`[StakingManagerService] Lock period conversion:
        Days: ${lockPeriodDays}
        Seconds: ${lockPeriodSeconds.toString()}`)

      console.log(`[StakingManagerService] Calling stakeLPToken with params:
        brandId: ${brandIdBN.toString()}
        amount: ${amountWei.toString()}
        lockPeriod: ${lockPeriodSeconds.toString()}
        signer: ${signer.address}`)

      // Call the stakeLPToken function
      const transaction = await stakingManagerWithSigner.stakeLPToken(
        brandIdBN,
        amountWei,
        lockPeriodSeconds,
      )

      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)

      // Wait for transaction to be mined
      const receipt = await transaction.wait()
      console.log(`[StakingManagerService] Transaction confirmed in block ${receipt.blockNumber}`)

      return {
        success: true,
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        brandId,
        amount,
        userAddress,
        lockPeriod: lockPeriodDays,
      }
    } catch (error) {
      console.error(`[StakingManagerService] Error in stakeLPToken:`, error)
      console.error(`[StakingManagerService] Error details:`, {
        message: error.message,
        code: error.code,
        data: error.data,
        transaction: error.transaction,
      })
      throw error
    }
  }

  /**
   * Check if a user can stake LP tokens
   * @param brandId The brand ID (UUID)
   * @param userAddress The address of the user
   * @param amount The amount of LP tokens to stake
   * @returns Whether the user can stake LP tokens
   */
  async canUserStakeLP(
    brandId: string,
    userAddress: string,
    amount: string,
  ): Promise<{
    canStake: boolean
    reason?: string
    balance?: string
    allowance?: string
    minStakeAmount?: string
  }> {
    try {
      console.log(`[StakingManagerService] Starting canUserStakeLP check with params:
        brandId: ${brandId}
        userAddress: ${userAddress}
        amount: ${amount}`)

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)
      console.log(`[StakingManagerService] Converted brandId to BigNumber: ${brandIdBN.toString()}`)

      // Get the staking config to check minimum stake amount
      try {
        console.log(`[StakingManagerService] Getting staking config for brand ${brandId}...`)
        const config = await this.StakingManagerContract.stakingConfigs(brandIdBN)
        console.log(`[StakingManagerService] Retrieved staking config:`, {
          baseRewardRate: config[0].toString(),
          bonusRewardRate: config[1].toString(),
          maxLockPeriod: config[2].toString(),
          minStakeAmount: config[3].toString(),
          paused: config[4],
        })

        // Check if staking is configured for this brand
        if (!config[0] || config[0].toString() === '0') {
          console.error(`[StakingManagerService] Brand ${brandId} not configured for staking`)
          return {
            canStake: false,
            reason: 'Brand not configured for staking',
          }
        }

        // Check if staking is paused for this brand
        if (config[4]) {
          console.error(`[StakingManagerService] Staking is paused for brand ${brandId}`)
          return {
            canStake: false,
            reason: 'Staking is currently paused for this brand',
          }
        }

        const minStakeAmount = this.formatEther(config[3])
        console.log(`[StakingManagerService] Minimum stake amount: ${minStakeAmount}`)

        // Check if amount is less than minimum stake amount
        if (new BigNumber(amount).isLessThan(minStakeAmount)) {
          console.error(
            `[StakingManagerService] Amount ${amount} is less than minimum stake amount ${minStakeAmount}`,
          )
          return {
            canStake: false,
            reason: `Amount is less than minimum stake amount`,
            minStakeAmount,
          }
        }
      } catch (error) {
        console.error(`[StakingManagerService] Error getting staking config:`, error)
        return {
          canStake: false,
          reason: `Failed to get staking config: ${error.message}`,
        }
      }

      // Get LP token address
      let lpTokenAddress
      try {
        console.log(`[StakingManagerService] Getting LP token address for brand ${brandId}...`)
        lpTokenAddress = await this.brandManagerService.getLPTokenAddress(brandId)
        console.log(`[StakingManagerService] LP token address: ${lpTokenAddress}`)

        if (!lpTokenAddress) {
          console.error(`[StakingManagerService] LP token not found for brand ${brandId}`)
          return {
            canStake: false,
            reason: 'LP token not found for this brand',
          }
        }
      } catch (error) {
        console.error(`[StakingManagerService] Error getting LP token address:`, error)
        return {
          canStake: false,
          reason: `Failed to get LP token address: ${error.message}`,
        }
      }

      // Create ERC20 token contract interface
      const erc20ABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function allowance(address owner, address spender) view returns (uint256)',
      ]
      console.log(
        `[StakingManagerService] Creating LP token contract for address: ${lpTokenAddress}`,
      )
      const lpTokenContract = new ethers.Contract(lpTokenAddress, erc20ABI, this.provider)

      // Check user's LP token balance
      console.log(`[StakingManagerService] Checking LP balance for user: ${userAddress}`)
      const balance = await lpTokenContract.balanceOf(userAddress)
      console.log(`[StakingManagerService] User LP balance: ${balance.toString()}`)

      const amountBN = ethers.parseEther(amount)
      console.log(`[StakingManagerService] Amount to stake in wei: ${amountBN.toString()}`)

      if (balance < amountBN) {
        console.error(`[StakingManagerService] Insufficient LP token balance:
          Required: ${amountBN.toString()}
          Available: ${balance.toString()}`)
        return {
          canStake: false,
          reason: 'Insufficient LP token balance',
          balance: this.formatEther(balance),
        }
      }

      // Check allowance
      console.log(
        `[StakingManagerService] Checking LP allowance for user: ${userAddress}, spender: ${this.StakingManagerContract.target}`,
      )
      const allowance = await lpTokenContract.allowance(
        userAddress,
        this.StakingManagerContract.target,
      )
      console.log(`[StakingManagerService] User LP allowance: ${allowance.toString()}`)

      if (allowance < amountBN) {
        console.error(`[StakingManagerService] Insufficient LP token allowance:
          Required: ${amountBN.toString()}
          Available: ${allowance.toString()}`)
        return {
          canStake: false,
          reason: 'Insufficient LP token allowance',
          allowance: this.formatEther(allowance),
        }
      }

      console.log(`[StakingManagerService] All checks passed, user can stake LP tokens`)
      return {
        canStake: true,
        balance: this.formatEther(balance),
        allowance: this.formatEther(allowance),
      }
    } catch (error) {
      console.error(`[StakingManagerService] Error in canUserStakeLP:`, error)
      return {
        canStake: false,
        reason: `Error checking if user can stake: ${error.message}`,
      }
    }
  }

  /**
   * Get the LP token staked amount for a user
   * @param brandId The brand ID (UUID)
   * @param userAddress The address of the user
   * @returns The staked amount
   */
  async getLPStakedAmount(brandId: string, userAddress: string): Promise<string> {
    try {
      console.log(
        `[StakingManagerService] Getting LP staked amount for brand: ${brandId}, user: ${userAddress}`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the contract directly to get LP staked amount
      const lpStaked = await this.StakingManagerContract.getLPStaked(brandIdBN, userAddress)
      console.log(`[StakingManagerService] LP staked amount retrieved: ${lpStaked.toString()}`)

      return this.formatEther(lpStaked)
    } catch (error) {
      console.error('[StakingManagerService] Error getting LP staked amount:', error)
      throw new Error(`Failed to get LP staked amount: ${error.message}`)
    }
  }

  /**
   * Get the total LP tokens staked for a brand
   * @param brandId The brand ID (UUID)
   * @returns The total staked amount
   */
  async getTotalLPStaked(brandId: string): Promise<string> {
    try {
      console.log(`[StakingManagerService] Getting total LP staked for brand: ${brandId}`)

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the contract directly to get total LP staked
      const totalLPStaked = await this.StakingManagerContract.getTotalLPStaked(brandIdBN)
      console.log(`[StakingManagerService] Total LP staked retrieved: ${totalLPStaked.toString()}`)

      return this.formatEther(totalLPStaked)
    } catch (error) {
      console.error('[StakingManagerService] Error getting total LP staked:', error)
      throw new Error(`Failed to get total LP staked: ${error.message}`)
    }
  }

  /**
   * Get a signer for a specific address
   * @param address The address to get a signer for
   * @returns The signer
   */
  private async getSigner(_address: string): Promise<ethers.Signer> {
    try {
      // Create a wallet with the private key from the environment variable
      const privateKey = process.env.ADMIN_PRIVATE_KEY
      if (!privateKey) {
        throw new Error('ADMIN_PRIVATE_KEY environment variable not set')
      }

      // Create a wallet with the private key
      const wallet = new ethers.Wallet(privateKey, this.provider)

      // Return the wallet as a signer
      return wallet
    } catch (error) {
      console.error('[StakingManagerService] Error getting signer:', error)
      throw error
    }
  }

  /**
   * Claim LP staker fees
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Transaction hash
   */
  async claimLPStakerFees(brandId: string, userAddress: string): Promise<any> {
    try {
      console.log(
        `[StakingManagerService] Claiming LP staker fees for brand ${brandId}, user: ${userAddress}`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the contract directly to claim LP fees
      console.log(`[StakingManagerService] Calling claimLPFees with brandId: ${brandIdBN}`)
      const transaction = await this.StakingManagerContract.claimLPFees(brandIdBN)

      // Wait for the transaction to be mined
      console.log(`[StakingManagerService] Transaction sent: ${transaction.hash}`)
      const receipt = await transaction.wait()
      console.log(`[StakingManagerService] Transaction confirmed in block ${receipt.blockNumber}`)

      return {
        success: true,
        transactionHash: transaction.hash,
        blockNumber: receipt.blockNumber,
        brandId,
        userAddress,
      }
    } catch (error) {
      console.error('[StakingManagerService] Error claiming LP staker fees:', error)
      throw new Error(`Failed to claim LP staker fees: ${error.message}`)
    }
  }

  /**
   * Get pending LP staker fees
   * @param brandId The brand ID (UUID)
   * @param userAddress The user's wallet address
   * @returns Pending fees as string
   */
  async getPendingLPStakerFees(brandId: string, userAddress: string): Promise<string> {
    try {
      console.log(
        `[StakingManagerService] Getting pending LP staker fees for brand ${brandId}, user: ${userAddress}`,
      )

      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the contract directly to get pending LP fees
      const pendingFees = await this.StakingManagerContract.getPendingLPFees(brandIdBN, userAddress)
      console.log(`[StakingManagerService] Pending LP fees retrieved: ${pendingFees.toString()}`)

      return this.formatEther(pendingFees)
    } catch (error) {
      console.error('[StakingManagerService] Error getting pending LP staker fees:', error)
      throw new Error(`Failed to get pending LP staker fees: ${error.message}`)
    }
  }

  async getAPYHistory(brandId: string): Promise<
    Array<{
      timestamp: number
      btAPY: number
      lpAPY: number
      tradingVolume: string
      totalValueLocked: string
    }>
  > {
    try {
      // Get historical data points from the contract
      const historicalData = await this.StakingManagerContract.getHistoricalData(brandId)

      // Transform contract data into the required format
      return historicalData.map((point) => ({
        timestamp: point.timestamp.toNumber(),
        btAPY: point.brandTokenAPY.toNumber() / 100, // Convert basis points to percentage
        lpAPY: point.lpTokenAPY.toNumber() / 100,
        tradingVolume: point.tradingVolume.toString(),
        totalValueLocked: point.tvl.toString(),
      }))
    } catch (error) {
      console.error(`Error getting APY history for brand ${brandId}:`, error)
      throw new Error(`Failed to get APY history: ${error.message}`)
    }
  }
}
