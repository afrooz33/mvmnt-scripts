import { Injectable, OnModuleInit, BadRequestException, Logger } from '@nestjs/common'
import { ethers } from 'ethers'
import { ConfigService } from '@nestjs/config'
import LPManagerABI from '../abi/LPManager.abi'
import { PoolService } from './pool.service'
import { BlockchainService } from '../blockchain.service'
import { BigNumberish } from 'ethers'

@Injectable()
export class LPManagerService implements OnModuleInit {
  private contract: ethers.Contract
  private provider: ethers.Provider
  private readonly logger = new Logger(LPManagerService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly poolService: PoolService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async onModuleInit() {
    await this.initializeContract()
  }

  private async initializeContract() {
    const rpcURL = this.configService.get<string>('blockchain.provider.rpcURL')
    if (!rpcURL) {
      throw new Error('RPC URL not found in configuration')
    }

    const trustedEntityKey = this.configService.get<string>('blockchain.contract.trustedEntity.key')
    if (!trustedEntityKey) {
      throw new Error('Trusted entity key not found in configuration')
    }

    const lpManagerAddress = this.configService.get<string>('blockchain.contract.lpManager.address')
    if (!lpManagerAddress) {
      throw new Error('LP Manager address not found in configuration')
    }

    this.provider = new ethers.JsonRpcProvider(rpcURL)
    const signer = new ethers.Wallet(trustedEntityKey, this.provider)
    this.contract = new ethers.Contract(lpManagerAddress, LPManagerABI, signer)
  }

  private uuidToBigNumber(uuid: string): ethers.BigNumberish {
    // Remove hyphens and convert to hex
    const hexString = '0x' + uuid.replace(/-/g, '')

    // Convert to BigNumber
    return ethers.getBigInt(hexString)
  }

  async getPool(brandId: string) {
    try {
      console.log(`Getting pool info for brandId: ${brandId}`)
      const brandIdBN = this.uuidToBigNumber(brandId)
      console.log(`Converted to BigNumber brandId: ${brandIdBN.toString()}`)

      const [poolAddress, tokenReserve, stableReserve] = await this.contract.getPool(brandIdBN)
      console.log(
        `Pool address: ${poolAddress}, Token reserve: ${tokenReserve}, Stable reserve: ${stableReserve}`,
      )

      // Check if pool exists
      if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
        console.log('No pool found for this brand ID')
        return {
          poolAddress: null,
          tokenReserve: '0',
          stableReserve: '0',
        }
      }

      // Initialize pool service with the pool address
      try {
        await this.poolService.initializeContract(poolAddress)
      } catch (error) {
        console.error('Failed to initialize pool service:', error)
        // Continue even if pool service initialization fails
      }

      return {
        poolAddress,
        tokenReserve: tokenReserve.toString(),
        stableReserve: stableReserve.toString(),
      }
    } catch (error) {
      console.error('Failed to get pool info:', error)
      return {
        poolAddress: null,
        tokenReserve: '0',
        stableReserve: '0',
      }
    }
  }

  async createPool(brandId: string) {
    try {
      console.log(`Attempting to create pool for brandId: ${brandId}`)
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Check if pool exists first
      try {
        const [poolAddress, tokenReserve, stableReserve] = await this.contract.getPool(brandIdBN)
        if (poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000') {
          console.log(`Pool already exists at address: ${poolAddress}`)
          return {
            success: false,
            message: 'Pool already exists',
            poolAddress,
            tokenReserve: tokenReserve.toString(),
            stableReserve: stableReserve.toString(),
          }
        }
      } catch (error) {
        // If getPool fails, it likely means no pool exists, so we can proceed
        console.log('No existing pool found, proceeding with creation')
      }

      console.log(`Creating new pool for brandId: ${brandId}`)
      const tx = await this.contract.createPool(brandIdBN)
      console.log(`Transaction sent: ${tx.hash}`)
      await tx.wait()
      console.log('Transaction confirmed')

      // Verify pool was created
      const [newPoolAddress, ,] = await this.contract.getPool(brandIdBN)
      if (!newPoolAddress || newPoolAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Pool creation failed: pool address is null or zero address')
      }

      console.log(`Pool successfully created at address: ${newPoolAddress}`)
      return {
        success: true,
        message: 'Pool created successfully',
        poolAddress: newPoolAddress,
        transactionHash: tx.hash,
      }
    } catch (error) {
      console.error('Failed to create pool:', error)
      // Check if it's a contract revert error
      if (error.code === 'CALL_EXCEPTION') {
        throw new Error(
          `Contract error: ${
            error.reason || 'Pool creation failed - the contract reverted the transaction'
          }`,
        )
      }
      throw new Error(`Failed to create pool: ${error.message}`)
    }
  }

  async addLiquidity(
    brandId: string,
    tokenAmount: string,
    stableAmount: string,
    minLpAmount: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Adding liquidity - Brand ID: ${brandId}, Token: ${tokenAmount}, Stable: ${stableAmount}, Min LP: ${minLpAmount}`,
      )

      // Get signer address
      const signer = await this.blockchainService.getSigner()
      const signerAddress = await signer.getAddress()
      this.logger.log(`Signer address: ${signerAddress}`)

      // Get pool address
      const poolAddress = await this.getPoolAddress(brandId)
      if (!poolAddress) {
        throw new BadRequestException('Pool does not exist')
      }

      // Initialize pool contract
      const poolContract = await this.getPoolContract(poolAddress)

      // Get token addresses
      const [brandToken, stablecoin] = await Promise.all([
        poolContract.brandToken(),
        poolContract.stablecoin(),
      ])

      // Get token info
      const brandTokenContract = this.getTokenContract(brandToken)
      const stablecoinContract = this.getTokenContract(stablecoin)

      const [tokenDecimals, tokenSymbol, stableDecimals, stableSymbol] = await Promise.all([
        brandTokenContract.decimals(),
        brandTokenContract.symbol(),
        stablecoinContract.decimals(),
        stablecoinContract.symbol(),
      ])

      this.logger.log(`Token decimals: ${tokenDecimals}, Symbol: ${tokenSymbol}`)
      this.logger.log(`Stable decimals: ${stableDecimals}, Symbol: ${stableSymbol}`)

      // Convert amounts to wei
      const tokenAmountWei = ethers.parseUnits(tokenAmount, tokenDecimals)
      const stableAmountWei = ethers.parseUnits(stableAmount, stableDecimals)
      const minLpAmountWei = ethers.parseUnits(minLpAmount, 18) // LP tokens always use 18 decimals

      // Check balances
      const [tokenBalance, stableBalance] = await Promise.all([
        brandTokenContract.balanceOf(signerAddress),
        stablecoinContract.balanceOf(signerAddress),
      ])

      if (tokenBalance < tokenAmountWei) {
        throw new BadRequestException({
          success: false,
          message: 'Insufficient token balance',
          details: {
            required: tokenAmount,
            available: ethers.formatUnits(tokenBalance, tokenDecimals),
            token: tokenSymbol,
          },
        })
      }

      if (stableBalance < stableAmountWei) {
        throw new BadRequestException({
          success: false,
          message: 'Insufficient stablecoin balance',
          details: {
            required: stableAmount,
            available: ethers.formatUnits(stableBalance, stableDecimals),
            token: stableSymbol,
          },
        })
      }

      // Check allowances
      const [tokenAllowance, stableAllowance] = await Promise.all([
        brandTokenContract.allowance(signerAddress, poolAddress),
        stablecoinContract.allowance(signerAddress, poolAddress),
      ])

      if (tokenAllowance < tokenAmountWei) {
        throw new BadRequestException({
          success: false,
          message: 'Insufficient token allowance',
          details: {
            required: tokenAmount,
            available: ethers.formatUnits(tokenAllowance, tokenDecimals),
            token: tokenSymbol,
          },
        })
      }

      if (stableAllowance < stableAmountWei) {
        throw new BadRequestException({
          success: false,
          message: 'Insufficient stablecoin allowance',
          details: {
            required: stableAmount,
            available: ethers.formatUnits(stableAllowance, stableDecimals),
            token: stableSymbol,
          },
        })
      }

      // Add liquidity
      const tx = await poolContract.addLiquidity(
        tokenAmountWei,
        stableAmountWei,
        minLpAmountWei,
        signerAddress,
      )

      this.logger.log(`Add liquidity transaction sent: ${tx.hash}`)
      const receipt = await tx.wait()

      // Parse event
      const event = receipt.logs
        .map((log) => {
          try {
            return poolContract.interface.parseLog(log)
          } catch (e) {
            return null
          }
        })
        .find((event) => event?.name === 'LiquidityAdded')

      if (!event) {
        throw new Error('LiquidityAdded event not found in transaction receipt')
      }

      return {
        success: true,
        lpAmount: ethers.formatUnits(event.args.lpAmount, 18),
        transactionHash: receipt.transactionHash,
      }
    } catch (error) {
      this.logger.error('Failed to add liquidity:', error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(`Failed to add liquidity: ${error.message}`)
    }
  }

  async removeLiquidity(
    brandId: string,
    lpAmount: string,
    minTokenAmount: string,
    minStableAmount: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Removing liquidity - Brand ID: ${brandId}, LP Amount: ${lpAmount}, Min Token: ${minTokenAmount}, Min Stable: ${minStableAmount}`,
      )

      // Get signer address
      const signer = await this.blockchainService.getSigner()
      const signerAddress = await signer.getAddress()
      this.logger.log(`Signer address: ${signerAddress}`)

      // Get pool address
      const poolAddress = await this.getPoolAddress(brandId)
      if (!poolAddress) {
        throw new BadRequestException('Pool does not exist')
      }

      // Initialize pool contract
      const poolContract = await this.getPoolContract(poolAddress)

      // Check if user has sufficient LP tokens
      const lpBalance = await poolContract.balanceOf(signerAddress)
      if (lpBalance < BigInt(lpAmount)) {
        throw new BadRequestException('Insufficient LP token balance')
      }

      // Check if tokens are staked
      const stakingContract = await this.getStakingContract()
      if (stakingContract) {
        try {
          const stakeInfo = await stakingContract.getStakeInfo(signerAddress, brandId)
          if (stakeInfo && stakeInfo.amount > 0) {
            throw new BadRequestException(
              'LP tokens are staked. Please unstake before removing liquidity.',
            )
          }
        } catch (error) {
          // If getStakeInfo fails, assume tokens are not staked
          this.logger.warn('Failed to check stake info, proceeding with liquidity removal:', error)
        }
      }

      // Remove liquidity
      const tx = await poolContract.removeLiquidity(lpAmount, minTokenAmount, minStableAmount)

      this.logger.log(`Remove liquidity transaction sent: ${tx.hash}`)
      const receipt = await tx.wait()

      // Parse event
      const event = receipt.logs
        .map((log) => {
          try {
            return poolContract.interface.parseLog(log)
          } catch (e) {
            return null
          }
        })
        .find((event) => event?.name === 'LiquidityRemoved')

      if (!event) {
        throw new Error('LiquidityRemoved event not found in transaction receipt')
      }

      return {
        success: true,
        tokenAmount: event.args.tokenAmount.toString(),
        stableAmount: event.args.stableAmount.toString(),
        transactionHash: receipt.transactionHash,
      }
    } catch (error) {
      this.logger.error('Failed to remove liquidity:', error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(`Failed to remove liquidity: ${error.message}`)
    }
  }

  private async getStakingContract(): Promise<ethers.Contract | null> {
    try {
      const stakingAddress = this.configService.get<string>('blockchain.contract.staking.address')
      if (!stakingAddress) {
        return null
      }

      const stakingAbi = [
        'function getStakeInfo(address staker, uint256 brandId) view returns (tuple(uint256 amount, uint256 timestamp))',
      ]

      return new ethers.Contract(stakingAddress, stakingAbi, this.blockchainService.getSigner())
    } catch (error) {
      this.logger.error('Failed to get staking contract:', error)
      return null
    }
  }

  private async getNonce(): Promise<number> {
    const signer = await this.blockchainService.getSigner()
    const address = await signer.getAddress()
    return await this.provider.getTransactionCount(address, 'latest')
  }

  private async waitForTransaction(
    tx: ethers.ContractTransactionResponse,
  ): Promise<ethers.TransactionReceipt | null> {
    try {
      return await tx.wait()
    } catch (error) {
      if (error.code === 'NONCE_EXPIRED') {
        this.logger.warn('Transaction nonce expired, retrying with new nonce...')
        // Get the latest nonce
        const nonce = await this.getNonce()
        // Retry the transaction with the new nonce
        const signer = await this.blockchainService.getSigner()
        const newTx = await signer.sendTransaction({
          ...tx,
          nonce,
        })
        return await newTx.wait()
      }
      throw error
    }
  }

  async swap(
    brandId: string,
    isBuyToken: boolean,
    amountIn: BigNumberish,
    minAmountOut: BigNumberish,
  ) {
    try {
      const signer = await this.blockchainService.getSigner()
      const signerAddress = await signer.getAddress()

      // Get pool address
      const poolAddress = await this.getPoolAddress(brandId)
      if (!poolAddress) {
        throw new BadRequestException('Pool does not exist')
      }

      // Initialize pool contract
      const poolContract = await this.getPoolContract(poolAddress)

      // Get token addresses
      const [brandToken, stablecoin] = await Promise.all([
        poolContract.brandToken(),
        poolContract.stablecoin(),
      ])

      // Create token contracts
      const tokenToApprove = isBuyToken ? stablecoin : brandToken
      const tokenContract = this.getTokenContract(tokenToApprove)

      // Check allowance with proper type conversion
      const allowance = await tokenContract.allowance(signerAddress, poolAddress)
      const amountInBigInt = BigInt(amountIn.toString())
      const allowanceBigInt = BigInt(allowance.toString())

      if (allowanceBigInt < amountInBigInt) {
        this.logger.log(
          `Insufficient allowance. Current: ${allowanceBigInt}, Required: ${amountInBigInt}`,
        )
        throw new BadRequestException({
          success: false,
          message: 'Insufficient token allowance',
          details: {
            currentAllowance: allowanceBigInt.toString(),
            requiredAmount: amountInBigInt.toString(),
            token: tokenToApprove,
          },
        })
      }

      // Execute swap with nonce management
      const nonce = await this.getNonce()
      const tx = await poolContract.swap(isBuyToken, amountIn, minAmountOut, { nonce })
      const receipt = await this.waitForTransaction(tx)

      // Parse swap event
      const event = receipt.logs
        .map((log) => {
          try {
            return poolContract.interface.parseLog(log)
          } catch (e) {
            return null
          }
        })
        .find((event) => event?.name === 'Swap')

      if (!event) {
        throw new Error('Swap event not found in transaction receipt')
      }

      return {
        success: true,
        amountOut: event.args.amountOut.toString(),
        transactionHash: receipt.hash,
      }
    } catch (error) {
      this.logger.error('Failed to swap:', error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(`Failed to swap: ${error.message}`)
    }
  }

  async getAmountOut(brandId: string, isBuyToken: boolean, amountIn: string) {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      const amountOut = await this.contract.getAmountOut(brandIdBN, isBuyToken, BigInt(amountIn))
      return amountOut.toString()
    } catch (error) {
      throw new Error(`Failed to get amount out: ${error.message}`)
    }
  }

  async getPendingFees(brandId: string, userAddress: string) {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      const [lpProviderFees, lpStakerFees, btStakerFees] = await Promise.all([
        this.contract.getPendingLPProviderFees(brandIdBN, userAddress),
        this.contract.getPendingLPStakerFees(brandIdBN, userAddress),
        this.contract.getPendingBTStakerFees(brandIdBN, userAddress),
      ])
      return {
        lpProviderFees: lpProviderFees.toString(),
        lpStakerFees: lpStakerFees.toString(),
        btStakerFees: btStakerFees.toString(),
      }
    } catch (error) {
      throw new Error(`Failed to get pending fees: ${error.message}`)
    }
  }

  async claimFees(brandId: string, feeType: 'lpProvider' | 'lpStaker' | 'btStaker') {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      let tx
      switch (feeType) {
        case 'lpProvider':
          tx = await this.contract.claimLPProviderFees(brandIdBN)
          break
        case 'lpStaker':
          tx = await this.contract.claimLPStakerFees(brandIdBN)
          break
        case 'btStaker':
          tx = await this.contract.claimBTStakerFees(brandIdBN)
          break
      }
      const receipt = await tx.wait()
      const event = receipt.events?.find((e) => e.event === 'FeeClaimed')
      return {
        amount: event?.args?.amount.toString(),
        transactionHash: receipt.transactionHash,
      }
    } catch (error) {
      throw new Error(`Failed to claim fees: ${error.message}`)
    }
  }

  private async getPoolAddress(brandId: string): Promise<string | null> {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      const [poolAddress] = await this.contract.getPool(brandIdBN)

      if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
        return null
      }

      return poolAddress
    } catch (error) {
      this.logger.error('Failed to get pool address:', error)
      throw error
    }
  }

  private async getPoolContract(poolAddress: string): Promise<ethers.Contract> {
    try {
      const poolAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function removeLiquidity(uint256,uint256,uint256) returns (uint256,uint256)',
        'function transfer(address,uint256) returns (bool)',
        'function approve(address,uint256) returns (bool)',
        'function allowance(address,address) view returns (uint256)',
        'function addLiquidity(uint256,uint256,uint256,address) returns (uint256)',
        'function brandToken() view returns (address)',
        'function stablecoin() view returns (address)',
      ]

      return new ethers.Contract(poolAddress, poolAbi, this.blockchainService.getSigner())
    } catch (error) {
      this.logger.error('Failed to get pool contract:', error)
      throw error
    }
  }

  private getTokenContract(tokenAddress: string): ethers.Contract {
    return new ethers.Contract(
      tokenAddress,
      [
        'function balanceOf(address) view returns (uint256)',
        'function allowance(address,address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
      ],
      this.provider,
    )
  }
}
