import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { BigNumberish, ethers } from 'ethers'
import { IPool } from '../interfaces/pool.interface'
import { BlockchainService } from '../blockchain.service'
import { ConfigService } from '@nestjs/config'
import { PoolABI } from '../abi/Pool.abi'

// Custom error types
export class PoolError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any,
  ) {
    super(message)
    this.name = 'PoolError'
  }
}

export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly txHash?: string,
  ) {
    super(message)
    this.name = 'TransactionError'
  }
}

@Injectable()
export class PoolService implements IPool, OnModuleInit {
  private readonly logger = new Logger(PoolService.name)
  private contract!: ethers.Contract

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly configService: ConfigService,
  ) {}

  getProvider(): ethers.Provider {
    return this.blockchainService.getProvider()
  }

  async initializeContract(contractAddress: string): Promise<void> {
    try {
      if (!ethers.isAddress(contractAddress)) {
        throw new Error(`Invalid pool contract address: ${contractAddress}`)
      }

      this.logger.log('Initializing pool contract...')
      this.logger.log(`Contract address: ${contractAddress}`)

      // Get the signer from blockchain service
      const signer = await this.blockchainService.getSigner()
      if (!signer) {
        throw new Error('Failed to get signer from blockchain service')
      }

      const signerAddress = await signer.getAddress()
      this.logger.log(`Using signer address: ${signerAddress}`)

      // Initialize contract with signer
      this.contract = new ethers.Contract(contractAddress, PoolABI, signer)

      // Verify contract connection
      const address = await this.contract.getAddress()
      this.logger.log(`Successfully connected to pool contract at ${address}`)

      this.logger.log('Pool contract initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize pool contract:', error.message)
      throw error
    }
  }

  async onModuleInit() {
    try {
      // Get contract address with fallbacks
      const contractAddress =
        this.configService.get('blockchain.contract.pool.address') ||
        this.configService.get('POOL_CONTRACT_ADDRESS') ||
        this.configService.get('POOL_ADDRESS')

      if (!contractAddress) {
        throw new Error(
          'Pool contract address not configured. Please set POOL_CONTRACT_ADDRESS or POOL_ADDRESS in your .env file',
        )
      }

      if (!ethers.isAddress(contractAddress)) {
        throw new Error(`Invalid pool contract address: ${contractAddress}`)
      }

      this.logger.log('Initializing pool contract...')
      this.logger.log(`Contract address: ${contractAddress}`)

      // Ensure blockchain service is initialized
      await this.blockchainService.ensureInitialized()

      // Get the signer from blockchain service with retries
      let signer: ethers.Signer | null = null
      let retries = 0
      const maxRetries = 3

      while (!signer && retries < maxRetries) {
        try {
          signer = this.blockchainService.getSigner()
          if (!signer) {
            throw new Error('Signer is null')
          }
        } catch (error) {
          retries++
          if (retries === maxRetries) {
            throw new Error(`Failed to get signer after ${maxRetries} attempts: ${error.message}`)
          }
          this.logger.warn(`Failed to get signer, attempt ${retries} of ${maxRetries}. Retrying...`)
          // Wait longer between each retry
          await new Promise((resolve) => setTimeout(resolve, 2000 * retries))
          // Try to re-initialize blockchain service
          await this.blockchainService.ensureInitialized()
        }
      }

      const signerAddress = await signer.getAddress()
      this.logger.log(`Using signer address: ${signerAddress}`)

      // Initialize contract with signer
      this.contract = new ethers.Contract(contractAddress, PoolABI, signer)

      // Verify contract connection
      const address = await this.contract.getAddress()
      this.logger.log(`Successfully connected to pool contract at ${address}`)

      // Check if contract is initialized
      try {
        const tokenAddress = await this.contract.brandToken()
        this.logger.log(`Pool is initialized with brand token: ${tokenAddress}`)
      } catch (error) {
        this.logger.error('Failed to get brand token address:', error.message)
        this.logger.warn('Pool contract may not be initialized properly')
      }

      this.logger.log('Pool service initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize pool service:', error.message)
      throw error
    }
  }

  private validateAddress(address: string, fieldName: string): void {
    if (!address) {
      throw new BadRequestException(`${fieldName} address is required`)
    }
    if (!ethers.isAddress(address)) {
      throw new BadRequestException(`Invalid ${fieldName} address: ${address}`)
    }
  }

  private validateAmount(amount: BigNumberish, fieldName: string): void {
    if (!amount && amount !== 0) {
      throw new BadRequestException(`${fieldName} amount is required`)
    }
    try {
      // Convert to string and check if it's a valid number
      const amountStr = amount.toString()
      if (isNaN(Number(amountStr))) {
        throw new BadRequestException(`Invalid ${fieldName} amount: ${amount}`)
      }
      // Only check for positive values if it's not a minimum amount
      if (!fieldName.toLowerCase().includes('min') && Number(amountStr) <= 0) {
        throw new BadRequestException(`${fieldName} amount must be greater than 0`)
      }
    } catch (error) {
      throw new BadRequestException(`Invalid ${fieldName} amount: ${amount}`)
    }
  }

  private async handleTransaction(tx: any, operation: string): Promise<any> {
    try {
      this.logger.log(`Waiting for ${operation} transaction to be mined...`)
      const receipt = await tx.wait()
      this.logger.log(`${operation} transaction mined in block ${receipt.blockNumber}`)
      return receipt
    } catch (error) {
      this.logger.error(`Transaction failed for ${operation}:`, error)
      throw new TransactionError(
        `Failed to execute ${operation}: ${error.message}`,
        error.transaction?.hash,
      )
    }
  }

  async brandToken(): Promise<string> {
    try {
      this.logger.log('Getting brand token address')
      const address = await this.contract.brandToken()
      this.logger.log(`Brand token address: ${address}`)
      return address
    } catch (error) {
      this.logger.error('Failed to get brand token address:', error.message)
      throw new InternalServerErrorException(`Failed to get brand token address: ${error.message}`)
    }
  }

  async stablecoin(): Promise<string> {
    try {
      this.logger.log('Getting stablecoin address')
      const address = await this.contract.stablecoin()
      this.logger.log(`Stablecoin address: ${address}`)
      return address
    } catch (error) {
      this.logger.error('Failed to get stablecoin address:', error.message)
      throw error
    }
  }

  async manager(): Promise<string> {
    try {
      this.logger.log('Getting manager address')
      const address = await this.contract.manager()
      this.logger.log(`Manager address: ${address}`)
      return address
    } catch (error) {
      this.logger.error('Failed to get manager address:', error.message)
      throw error
    }
  }

  async brandId(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting brand ID')
      const id = await this.contract.brandId()
      this.logger.log(`Brand ID: ${id.toString()}`)
      return id
    } catch (error) {
      this.logger.error('Failed to get brand ID:', error.message)
      throw error
    }
  }

  async fee(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting fee')
      const fee = await this.contract.fee()
      this.logger.log(`Fee: ${fee.toString()}`)
      return fee
    } catch (error) {
      this.logger.error('Failed to get fee:', error.message)
      throw error
    }
  }

  async tokenReserve(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting token reserve')
      const reserve = await this.contract.tokenReserve()
      this.logger.log(`Token reserve: ${reserve.toString()}`)
      return reserve
    } catch (error) {
      this.logger.error('Failed to get token reserve:', error.message)
      throw error
    }
  }

  async stableReserve(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting stable reserve')
      const reserve = await this.contract.stableReserve()
      this.logger.log(`Stable reserve: ${reserve.toString()}`)
      return reserve
    } catch (error) {
      this.logger.error('Failed to get stable reserve:', error.message)
      throw error
    }
  }

  async totalSupply(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting total supply')
      const supply = await this.contract.totalSupply()
      this.logger.log(`Total supply: ${supply.toString()}`)
      return supply
    } catch (error) {
      this.logger.error('Failed to get total supply:', error.message)
      throw error
    }
  }

  async referencePrice(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting reference price')
      const price = await this.contract.referencePrice()
      this.logger.log(`Reference price: ${price.toString()}`)
      return price
    } catch (error) {
      this.logger.error('Failed to get reference price:', error.message)
      throw error
    }
  }

  async lastReferenceUpdate(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting last reference update')
      const timestamp = await this.contract.lastReferenceUpdate()
      this.logger.log(`Last reference update: ${timestamp.toString()}`)
      return timestamp
    } catch (error) {
      this.logger.error('Failed to get last reference update:', error.message)
      throw error
    }
  }

  async initialize(
    brandToken: string,
    stablecoin: string,
    brandId: BigNumberish,
    manager: string,
  ): Promise<void> {
    try {
      this.logger.log('Initializing pool with parameters:')
      this.logger.log(`Brand token: ${brandToken}`)
      this.logger.log(`Stablecoin: ${stablecoin}`)
      this.logger.log(`Brand ID: ${brandId.toString()}`)
      this.logger.log(`Manager: ${manager}`)

      const tx = await this.contract.initialize(brandToken, stablecoin, brandId, manager)
      this.logger.log(`Initialization transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Pool initialized successfully in block ${receipt.blockNumber}`)
    } catch (error) {
      this.logger.error('Failed to initialize pool:', error.message)
      throw error
    }
  }

  async addLiquidity(
    tokenAmount: string,
    stableAmount: string,
    minLpAmount: string,
    sender: string,
  ): Promise<bigint> {
    try {
      this.logger.log(
        `Adding liquidity - Token amount: ${tokenAmount}, Stable amount: ${stableAmount}, Min LP amount: ${minLpAmount}`,
      )

      // Validate input parameters
      this.validateAmount(tokenAmount, 'token')
      this.validateAmount(stableAmount, 'stable')
      this.validateAmount(minLpAmount, 'minimum LP')
      this.validateAddress(sender, 'sender')

      // Get contract addresses
      const brandTokenAddress = await this.brandToken()
      const stablecoinAddress = await this.stablecoin()

      // Get token contracts
      const brandTokenContract = this.getTokenContract(brandTokenAddress)
      const stablecoinContract = this.getTokenContract(stablecoinAddress)

      // Get token decimals
      const [brandTokenDecimals, stablecoinDecimals] = await Promise.all([
        brandTokenContract.decimals(),
        stablecoinContract.decimals(),
      ])

      // Convert amounts to wei
      const requiredTokenAmount = ethers.parseUnits(tokenAmount, brandTokenDecimals)
      const requiredStableAmount = ethers.parseUnits(stableAmount, stablecoinDecimals)

      // Check balances
      const [brandTokenBalance, stablecoinBalance] = await Promise.all([
        brandTokenContract.balanceOf(sender),
        stablecoinContract.balanceOf(sender),
      ])

      const formattedTokenBalance = ethers.formatUnits(brandTokenBalance, brandTokenDecimals)
      const formattedStableBalance = ethers.formatUnits(stablecoinBalance, stablecoinDecimals)
      const formattedRequiredToken = ethers.formatUnits(requiredTokenAmount, brandTokenDecimals)
      const formattedRequiredStable = ethers.formatUnits(requiredStableAmount, stablecoinDecimals)

      // Check allowances
      const [brandTokenAllowance, stablecoinAllowance] = await Promise.all([
        brandTokenContract.allowance(sender, this.manager()),
        stablecoinContract.allowance(sender, this.manager()),
      ])

      const formattedTokenAllowance = ethers.formatUnits(brandTokenAllowance, brandTokenDecimals)
      const formattedStableAllowance = ethers.formatUnits(stablecoinAllowance, stablecoinDecimals)

      // Prepare balance and requirement details
      const balanceDetails = {
        token: {
          symbol: 'TT',
          balance: formattedTokenBalance,
          required: formattedRequiredToken,
          allowance: formattedTokenAllowance,
          hasEnoughBalance: brandTokenBalance >= requiredTokenAmount,
          hasEnoughAllowance: brandTokenAllowance >= requiredTokenAmount,
        },
        stable: {
          symbol: 'USDC',
          balance: formattedStableBalance,
          required: formattedRequiredStable,
          allowance: formattedStableAllowance,
          hasEnoughBalance: stablecoinBalance >= requiredStableAmount,
          hasEnoughAllowance: stablecoinAllowance >= requiredStableAmount,
        },
      }

      // Check balances and throw detailed errors if insufficient
      if (brandTokenBalance < requiredTokenAmount) {
        throw new PoolError(`Insufficient TT balance`, 'INSUFFICIENT_TOKEN_BALANCE', {
          ...balanceDetails,
          message: `You need ${formattedRequiredToken} TT but have ${formattedTokenBalance} TT`,
        })
      }

      if (stablecoinBalance < requiredStableAmount) {
        throw new PoolError(`Insufficient USDC balance`, 'INSUFFICIENT_STABLE_BALANCE', {
          ...balanceDetails,
          message: `You need ${formattedRequiredStable} USDC but have ${formattedStableBalance} USDC`,
        })
      }

      if (brandTokenAllowance < requiredTokenAmount) {
        throw new PoolError(`Insufficient TT allowance`, 'INSUFFICIENT_TOKEN_ALLOWANCE', {
          ...balanceDetails,
          message: `You need to approve ${formattedRequiredToken} TT but have approved ${formattedTokenAllowance} TT`,
        })
      }

      if (stablecoinAllowance < requiredStableAmount) {
        throw new PoolError(`Insufficient USDC allowance`, 'INSUFFICIENT_STABLE_ALLOWANCE', {
          ...balanceDetails,
          message: `You need to approve ${formattedRequiredStable} USDC but have approved ${formattedStableAllowance} USDC`,
        })
      }

      // Execute addLiquidity
      const tx = await this.contract.addLiquidity(
        requiredTokenAmount,
        requiredStableAmount,
        ethers.parseUnits(minLpAmount, 18),
        sender,
      )

      const receipt = await this.handleTransaction(tx, 'addLiquidity')

      // Parse the LiquidityAdded event
      const event = await this.parseContractEvent(receipt, 'LiquidityAdded')
      if (!event) {
        throw new PoolError(
          'LiquidityAdded event not found in transaction receipt',
          'EVENT_NOT_FOUND',
          {
            ...balanceDetails,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
          },
        )
      }

      // Get updated balances after successful liquidity addition
      const [newTokenBalance, newStableBalance] = await Promise.all([
        brandTokenContract.balanceOf(sender),
        stablecoinContract.balanceOf(sender),
      ])

      const updatedBalances = {
        token: {
          symbol: 'TT',
          previousBalance: formattedTokenBalance,
          newBalance: ethers.formatUnits(newTokenBalance, brandTokenDecimals),
          change: ethers.formatUnits(brandTokenBalance - newTokenBalance, brandTokenDecimals),
        },
        stable: {
          symbol: 'USDC',
          previousBalance: formattedStableBalance,
          newBalance: ethers.formatUnits(newStableBalance, stablecoinDecimals),
          change: ethers.formatUnits(stablecoinBalance - newStableBalance, stablecoinDecimals),
        },
        lpTokens: {
          amount: ethers.formatUnits(event.args.lpAmount, 18),
        },
      }

      this.logger.log('Liquidity added successfully:')
      this.logger.log(JSON.stringify(updatedBalances, null, 2))

      return BigInt(event.args.lpAmount.toString())
    } catch (error) {
      this.logger.error('Failed to add liquidity:', error)
      if (error instanceof PoolError) {
        throw error
      }
      throw new PoolError(`Failed to add liquidity: ${error.message}`, 'ADD_LIQUIDITY_FAILED', {
        originalError: error.message,
        stack: error.stack,
      })
    }
  }

  async removeLiquidity(
    lpAmount: string,
    minTokenAmount: string,
    minStableAmount: string,
  ): Promise<[bigint, bigint]> {
    try {
      // Validate inputs
      this.validateAmount(lpAmount, 'LP')
      this.validateAmount(minTokenAmount, 'minimum token')
      this.validateAmount(minStableAmount, 'minimum stable')

      // Get signer address
      const signer = await this.blockchainService.getSigner()
      const signerAddress = await signer.getAddress()

      // Get token addresses and decimals
      const [brandToken, stablecoin] = await Promise.all([
        this.contract.brandToken(),
        this.contract.stablecoin(),
      ])

      // Create token contract instances
      const brandTokenContract = new ethers.Contract(
        brandToken,
        ['function decimals() view returns (uint8)', 'function symbol() view returns (string)'],
        signer,
      )

      const stablecoinContract = new ethers.Contract(
        stablecoin,
        ['function decimals() view returns (uint8)', 'function symbol() view returns (string)'],
        signer,
      )

      // Get token info
      const [tokenDecimals, stableDecimals, tokenSymbol, stableSymbol] = await Promise.all([
        brandTokenContract.decimals(),
        stablecoinContract.decimals(),
        brandTokenContract.symbol(),
        stablecoinContract.symbol(),
      ])

      // Check LP token balance
      const lpBalance = await this.contract.balanceOf(signerAddress)
      const formattedLpAmount = ethers.parseUnits(lpAmount, 18) // LP tokens are always 18 decimals

      if (formattedLpAmount > lpBalance) {
        const required = ethers.formatUnits(formattedLpAmount, 18)
        const available = ethers.formatUnits(lpBalance, 18)
        throw new BadRequestException(
          `Insufficient LP token balance. Required: ${required} LP, Available: ${available} LP`,
        )
      }

      this.logger.log(`Removing liquidity with parameters:`)
      this.logger.log(`LP Amount: ${ethers.formatUnits(formattedLpAmount, 18)} LP`)
      this.logger.log(`Min ${tokenSymbol} Amount: ${minTokenAmount} ${tokenSymbol}`)
      this.logger.log(`Min ${stableSymbol} Amount: ${minStableAmount} ${stableSymbol}`)

      // Format minimum amounts
      const formattedMinTokenAmount = ethers.parseUnits(minTokenAmount, tokenDecimals)
      const formattedMinStableAmount = ethers.parseUnits(minStableAmount, stableDecimals)

      const tx = await this.contract.removeLiquidity(
        formattedLpAmount,
        formattedMinTokenAmount,
        formattedMinStableAmount,
      )
      this.logger.log(`Remove liquidity transaction sent: ${tx.hash}`)

      const receipt = await this.handleTransaction(tx, 'removeLiquidity')

      const event = receipt.logs
        .map((log) => {
          try {
            return this.contract.interface.parseLog(log)
          } catch (e) {
            return null
          }
        })
        .find((e) => e?.name === 'LiquidityRemoved')

      if (!event) {
        throw new PoolError(
          'LiquidityRemoved event not found in transaction receipt',
          'EVENT_NOT_FOUND',
        )
      }

      this.logger.log(`Liquidity removed successfully:`)
      this.logger.log(
        `${tokenSymbol} amount received: ${ethers.formatUnits(
          event.args.tokenAmount,
          tokenDecimals,
        )} ${tokenSymbol}`,
      )
      this.logger.log(
        `${stableSymbol} amount received: ${ethers.formatUnits(
          event.args.stableAmount,
          stableDecimals,
        )} ${stableSymbol}`,
      )

      return [event.args.tokenAmount, event.args.stableAmount]
    } catch (error) {
      this.logger.error(`Failed to remove liquidity: ${error.message}`)
      if (
        error instanceof BadRequestException ||
        error instanceof PoolError ||
        error instanceof TransactionError
      ) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to remove liquidity: ${error.message}`)
    }
  }

  async getPriceInfo(): Promise<{
    currentPrice: BigNumberish
    refPrice: BigNumberish
    lowerBound: BigNumberish
    upperBound: BigNumberish
    nextUpdate: BigNumberish
  }> {
    try {
      this.logger.log('Getting price info')
      const priceInfo = await this.contract.getPriceInfo()

      this.logger.log('Price info retrieved:')
      this.logger.log(`Current price: ${priceInfo.currentPrice.toString()}`)
      this.logger.log(`Reference price: ${priceInfo.refPrice.toString()}`)
      this.logger.log(`Lower bound: ${priceInfo.lowerBound.toString()}`)
      this.logger.log(`Upper bound: ${priceInfo.upperBound.toString()}`)
      this.logger.log(`Next update: ${priceInfo.nextUpdate.toString()}`)

      return priceInfo
    } catch (error) {
      this.logger.error('Failed to get price info:', error.message)
      throw error
    }
  }

  async getCurrentPrice(): Promise<BigNumberish> {
    try {
      this.logger.log('Getting current price')
      const price = await this.contract.getCurrentPrice()
      this.logger.log(`Current price: ${price.toString()}`)
      return price
    } catch (error) {
      this.logger.error('Failed to get current price:', error.message)
      throw error
    }
  }

  async getPriceBounds(): Promise<[BigNumberish, BigNumberish]> {
    try {
      this.logger.log('Getting price bounds')
      const bounds = await this.contract.getPriceBounds()
      this.logger.log(
        `Price bounds - Lower: ${bounds[0].toString()}, Upper: ${bounds[1].toString()}`,
      )
      return bounds
    } catch (error) {
      this.logger.error('Failed to get price bounds:', error.message)
      throw error
    }
  }

  async updateReferencePrice(): Promise<boolean> {
    try {
      this.logger.log('Updating reference price')
      const tx = await this.contract.updateReferencePrice()
      this.logger.log(`Update reference price transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      const updated = receipt.events.some((e) => e.event === 'ReferencePriceUpdated')

      this.logger.log(`Reference price ${updated ? 'updated successfully' : 'not updated'}`)
      return updated
    } catch (error) {
      this.logger.error('Failed to update reference price:', error.message)
      throw error
    }
  }

  private async parseContractEvent(receipt: any, eventName: string): Promise<any> {
    const iface = this.contract.interface
    const event = receipt.logs
      .map((log) => {
        try {
          return iface.parseLog(log)
        } catch (e) {
          return null
        }
      })
      .find((event) => event?.name === eventName)

    if (!event) {
      throw new PoolError(`${eventName} event not found in transaction receipt`, 'EVENT_NOT_FOUND')
    }

    return event
  }

  private async validateSwapParameters(
    isBuyToken: boolean,
    amountIn: BigNumberish,
    minAmountOut: BigNumberish,
  ): Promise<void> {
    try {
      // Validate input amounts
      this.validateAmount(amountIn, 'input')
      this.validateAmount(minAmountOut, 'minimum output')

      // Get current reserves to check liquidity
      const [tokenReserve, stableReserve] = await Promise.all([
        this.tokenReserve(),
        this.stableReserve(),
      ])

      // Check if pool has sufficient liquidity
      if (isBuyToken && tokenReserve.toString() === '0') {
        throw new BadRequestException({
          message: 'No token liquidity available in the pool',
          code: 'INSUFFICIENT_TOKEN_LIQUIDITY',
          details: {
            tokenReserve: tokenReserve.toString(),
            stableReserve: stableReserve.toString(),
          },
        })
      }

      if (!isBuyToken && stableReserve.toString() === '0') {
        throw new BadRequestException({
          message: 'No stablecoin liquidity available in the pool',
          code: 'INSUFFICIENT_STABLE_LIQUIDITY',
          details: {
            tokenReserve: tokenReserve.toString(),
            stableReserve: stableReserve.toString(),
          },
        })
      }

      // Calculate expected output amount
      const amountOut = await this.contract.getAmountOut(isBuyToken, amountIn)

      if (amountOut.toString() === '0') {
        throw new BadRequestException({
          message: 'Swap would result in zero output amount',
          code: 'ZERO_OUTPUT_AMOUNT',
          details: {
            amountIn: amountIn.toString(),
            isBuyToken,
          },
        })
      }

      // Check if minimum output amount is reasonable
      if (
        ethers.parseUnits(amountOut.toString(), 0) < ethers.parseUnits(minAmountOut.toString(), 0)
      ) {
        throw new BadRequestException({
          message: 'Minimum output amount is too high',
          code: 'INVALID_MIN_OUTPUT',
          details: {
            expectedOutput: amountOut.toString(),
            minimumOutput: minAmountOut.toString(),
            slippage: `${((Number(minAmountOut) / Number(amountOut) - 1) * 100).toFixed(2)}%`,
          },
        })
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException({
        message: `Failed to validate swap parameters: ${error.message}`,
        code: 'VALIDATION_ERROR',
        details: {
          isBuyToken,
          amountIn: amountIn.toString(),
          minAmountOut: minAmountOut.toString(),
        },
      })
    }
  }

  async swap(
    isBuyToken: boolean,
    amountIn: BigNumberish,
    minAmountOut: BigNumberish,
  ): Promise<BigNumberish> {
    try {
      this.logger.log('Initiating swap operation...')
      this.logger.log(
        `Parameters - Is Buy Token: ${isBuyToken}, Amount In: ${amountIn}, Min Amount Out: ${minAmountOut}`,
      )

      // Validate parameters and check liquidity
      await this.validateSwapParameters(isBuyToken, amountIn, minAmountOut)

      // Execute swap transaction
      const tx = await this.contract.swap(isBuyToken, amountIn, minAmountOut)
      this.logger.log(`Swap transaction sent: ${tx.hash}`)

      // Wait for transaction confirmation
      const receipt = await this.handleTransaction(tx, 'swap')

      // Parse swap event
      const swapEvent = await this.parseContractEvent(receipt, 'Swap')

      this.logger.log(`Swap successful. Amount out: ${swapEvent.args.amountOut.toString()}`)
      return swapEvent.args.amountOut
    } catch (error) {
      this.logger.error('Failed to execute swap:', error.message)

      if (error instanceof BadRequestException) {
        throw error
      }

      // Handle specific contract errors
      if (error.message?.includes('insufficient liquidity')) {
        throw new BadRequestException({
          message: 'Insufficient liquidity for the requested swap',
          code: 'INSUFFICIENT_LIQUIDITY',
          details: {
            isBuyToken,
            amountIn: amountIn.toString(),
          },
        })
      }

      if (error.message?.includes('invalid amount')) {
        throw new BadRequestException({
          message: 'Invalid input amount for swap',
          code: 'INVALID_AMOUNT',
          details: {
            amountIn: amountIn.toString(),
            isBuyToken,
          },
        })
      }

      throw new InternalServerErrorException({
        message: `Failed to execute swap: ${error.message}`,
        code: 'SWAP_ERROR',
        details: {
          isBuyToken,
          amountIn: amountIn.toString(),
          minAmountOut: minAmountOut.toString(),
        },
      })
    }
  }

  async getAmountOut(isBuyToken: boolean, amountIn: BigNumberish): Promise<BigNumberish> {
    try {
      this.logger.log('Calculating swap output amount...')
      this.logger.log(`Parameters - Is Buy Token: ${isBuyToken}, Amount In: ${amountIn}`)

      // Validate input amount
      this.validateAmount(amountIn, 'input')

      // Get current reserves
      const [tokenReserve, stableReserve] = await Promise.all([
        this.tokenReserve(),
        this.stableReserve(),
      ])

      this.logger.log(`Current reserves - Token: ${tokenReserve}, Stable: ${stableReserve}`)

      // Check liquidity
      if (isBuyToken && tokenReserve.toString() === '0') {
        throw new PoolError(
          'No token liquidity available in the pool',
          'INSUFFICIENT_TOKEN_LIQUIDITY',
        )
      }

      if (!isBuyToken && stableReserve.toString() === '0') {
        throw new PoolError(
          'No stablecoin liquidity available in the pool',
          'INSUFFICIENT_STABLE_LIQUIDITY',
        )
      }

      // Calculate output amount
      const amountOut = await this.contract.getAmountOut(isBuyToken, amountIn)

      if (amountOut.toString() === '0') {
        throw new PoolError('Swap would result in zero output amount', 'ZERO_OUTPUT_AMOUNT')
      }

      this.logger.log(`Calculated amount out: ${amountOut}`)
      return amountOut
    } catch (error) {
      this.logger.error('Failed to calculate amount out:', error.message)

      if (error instanceof PoolError) {
        throw error
      }

      // Handle specific contract errors
      if (error.message?.includes('insufficient liquidity')) {
        throw new PoolError(
          'Insufficient liquidity for the requested swap',
          'INSUFFICIENT_LIQUIDITY',
        )
      }

      if (error.message?.includes('invalid amount')) {
        throw new PoolError('Invalid input amount for swap calculation', 'INVALID_AMOUNT')
      }

      throw new PoolError(
        `Failed to calculate swap output amount: ${error.message}`,
        'CALCULATION_ERROR',
      )
    }
  }

  async setFee(newFee: BigNumberish): Promise<void> {
    try {
      this.logger.log(`Setting new fee: ${newFee.toString()}`)
      const tx = await this.contract.setFee(newFee)
      this.logger.log(`Set fee transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Fee updated successfully in block ${receipt.blockNumber}`)
    } catch (error) {
      this.logger.error('Failed to set fee:', error.message)
      throw error
    }
  }

  async pause(): Promise<void> {
    try {
      this.logger.log('Pausing pool')
      const tx = await this.contract.pause()
      this.logger.log(`Pause transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Pool paused successfully in block ${receipt.blockNumber}`)
    } catch (error) {
      this.logger.error('Failed to pause pool:', error.message)
      throw error
    }
  }

  async unpause(): Promise<void> {
    try {
      this.logger.log('Unpausing pool')
      const tx = await this.contract.unpause()
      this.logger.log(`Unpause transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Pool unpaused successfully in block ${receipt.blockNumber}`)
    } catch (error) {
      this.logger.error('Failed to unpause pool:', error.message)
      throw error
    }
  }

  async balanceOf(account: string): Promise<BigNumberish> {
    try {
      this.logger.log(`Getting balance for account: ${account}`)
      const balance = await this.contract.balanceOf(account)
      this.logger.log(`Balance: ${balance.toString()}`)
      return balance
    } catch (error) {
      this.logger.error('Failed to get balance:', error.message)
      throw error
    }
  }

  async transfer(to: string, amount: BigNumberish): Promise<boolean> {
    try {
      this.logger.log(`Transferring ${amount.toString()} to ${to}`)
      const tx = await this.contract.transfer(to, amount)
      this.logger.log(`Transfer transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Transfer successful in block ${receipt.blockNumber}`)
      return true
    } catch (error) {
      this.logger.error('Failed to transfer:', error.message)
      throw error
    }
  }

  async allowance(owner: string, spender: string): Promise<BigNumberish> {
    try {
      this.logger.log(`Getting allowance for owner: ${owner}, spender: ${spender}`)
      const allowance = await this.contract.allowance(owner, spender)
      this.logger.log(`Allowance: ${allowance.toString()}`)
      return allowance
    } catch (error) {
      this.logger.error('Failed to get allowance:', error.message)
      throw error
    }
  }

  async getTokenAllowances(owner: string, spender: string): Promise<[BigNumberish, BigNumberish]> {
    try {
      this.logger.log(`Getting token allowances for owner: ${owner}, spender: ${spender}`)

      const [brandToken, stablecoin] = await Promise.all([
        this.contract.brandToken(),
        this.contract.stablecoin(),
      ])

      this.logger.log(`Brand token address: ${brandToken}`)
      this.logger.log(`Stablecoin address: ${stablecoin}`)

      // Create contract instances for both tokens
      const brandTokenContract = new ethers.Contract(
        brandToken,
        [
          'function approve(address,uint256) returns (bool)',
          'function allowance(address,address) view returns (uint256)',
          'function balanceOf(address) view returns (uint256)',
          'function transfer(address,uint256) returns (bool)',
          'function transferFrom(address,address,uint256) returns (bool)',
        ],
        this.blockchainService.getSigner(),
      )

      const stablecoinContract = new ethers.Contract(
        stablecoin,
        [
          'function approve(address,uint256) returns (bool)',
          'function allowance(address,address) view returns (uint256)',
          'function balanceOf(address) view returns (uint256)',
          'function transfer(address,uint256) returns (bool)',
          'function transferFrom(address,address,uint256) returns (bool)',
        ],
        this.blockchainService.getSigner(),
      )

      // Get allowances for both tokens
      const [brandTokenAllowance, stablecoinAllowance] = await Promise.all([
        brandTokenContract.allowance(owner, spender),
        stablecoinContract.allowance(owner, spender),
      ])

      this.logger.log(`Brand token allowance: ${brandTokenAllowance.toString()}`)
      this.logger.log(`Stablecoin allowance: ${stablecoinAllowance.toString()}`)

      return [brandTokenAllowance, stablecoinAllowance]
    } catch (error) {
      this.logger.error('Failed to get token allowances:', error.message)
      throw error
    }
  }

  async transferFrom(from: string, to: string, amount: BigNumberish): Promise<boolean> {
    try {
      this.logger.log(`Transferring ${amount.toString()} from ${from} to ${to}`)
      const tx = await this.contract.transferFrom(from, to, amount)
      this.logger.log(`Transfer from transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Transfer from successful in block ${receipt.blockNumber}`)
      return true
    } catch (error) {
      this.logger.error('Failed to transfer from:', error.message)
      throw error
    }
  }

  async emergencyWithdraw(token: string, to: string, amount: BigNumberish): Promise<void> {
    try {
      this.logger.log(`Emergency withdrawing ${amount.toString()} of token ${token} to ${to}`)
      const tx = await this.contract.emergencyWithdraw(token, to, amount)
      this.logger.log(`Emergency withdraw transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Emergency withdraw successful in block ${receipt.blockNumber}`)
    } catch (error) {
      this.logger.error('Failed to emergency withdraw:', error.message)
      throw error
    }
  }

  async getPoolInfo(): Promise<any> {
    this.logger.log('Getting pool info')
    try {
      const [brandToken, stablecoin, manager, brandId, fee] = await Promise.all([
        this.contract.brandToken(),
        this.contract.stablecoin(),
        this.contract.manager(),
        this.contract.brandId(),
        this.contract.fee(),
      ])

      // Create token contracts
      const brandTokenContract = this.getTokenContract(brandToken)
      const stablecoinContract = this.getTokenContract(stablecoin)

      // Get token decimals
      const [brandTokenDecimals, stablecoinDecimals] = await Promise.all([
        brandTokenContract.decimals(),
        stablecoinContract.decimals(),
      ])

      const info = {
        brandToken,
        stablecoin,
        manager,
        brandId: brandId.toString(),
        fee: fee.toString(),
        brandTokenDecimals: Number(brandTokenDecimals),
        stablecoinDecimals: Number(stablecoinDecimals),
      }

      this.logger.log('Pool info retrieved:')
      this.logger.log(JSON.stringify(info, null, 2))

      return info
    } catch (error) {
      this.logger.error('Failed to get pool info:', error.message)
      throw error
    }
  }

  async approve(token: string, spender: string, amount: BigNumberish): Promise<boolean> {
    try {
      this.logger.log(`Approving ${amount.toString()} tokens for spender ${spender}`)

      // Create token contract instance
      const tokenContract = new ethers.Contract(
        token,
        [
          'function approve(address,uint256) returns (bool)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)',
        ],
        await this.blockchainService.getSigner(),
      )

      // Get token info
      const [decimals, symbol] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
      ])

      this.logger.log(`Approving ${ethers.formatUnits(amount, decimals)} ${symbol} for ${spender}`)

      const tx = await tokenContract.approve(spender, amount)
      this.logger.log(`Approve transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Approval successful in block ${receipt.blockNumber}`)

      return true
    } catch (error) {
      this.logger.error('Failed to approve tokens:', error.message)
      throw error
    }
  }

  async getTokenBalance(tokenAddress: string, accountAddress: string): Promise<BigNumberish> {
    try {
      this.validateAddress(tokenAddress, 'token')
      this.validateAddress(accountAddress, 'account')

      const tokenContract = this.getTokenContract(tokenAddress)
      const balance = await tokenContract.balanceOf(accountAddress)

      this.logger.log(`Token balance for ${accountAddress}: ${balance.toString()}`)
      return balance
    } catch (error) {
      this.logger.error('Failed to get token balance:', error.message)
      throw error
    }
  }

  private getTokenContract(address: string): ethers.Contract {
    const tokenABI = [
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address,address) view returns (uint256)',
      'function approve(address,uint256) returns (bool)',
      'function transfer(address,uint256) returns (bool)',
      'function transferFrom(address,address,uint256) returns (bool)',
    ]

    return new ethers.Contract(address, tokenABI, this.blockchainService.getSigner())
  }

  async getContractAddress(): Promise<string> {
    try {
      return await this.contract.getAddress()
    } catch (error) {
      this.logger.error('Failed to get contract address:', error.message)
      throw error
    }
  }

  async getAddLiquidityCalldata(
    tokenAmount: string,
    stableAmount: string,
    minLpAmount: string,
    sender: string,
  ): Promise<{ calldata: string; contractAddress: string }> {
    try {
      this.logger.log(
        `Getting add liquidity calldata - Token amount: ${tokenAmount}, Stable amount: ${stableAmount}, Min LP amount: ${minLpAmount}`,
      )

      // Validate input parameters
      this.validateAmount(tokenAmount, 'token')
      this.validateAmount(stableAmount, 'stable')
      this.validateAmount(minLpAmount, 'minimum LP')
      this.validateAddress(sender, 'sender')

      // Get contract addresses
      const brandTokenAddress = await this.brandToken()
      const stablecoinAddress = await this.stablecoin()

      // Get token contracts
      const brandTokenContract = this.getTokenContract(brandTokenAddress)
      const stablecoinContract = this.getTokenContract(stablecoinAddress)

      // Get token decimals
      const [brandTokenDecimals, stablecoinDecimals] = await Promise.all([
        brandTokenContract.decimals(),
        stablecoinContract.decimals(),
      ])

      // Convert amounts to wei
      const requiredTokenAmount = ethers.parseUnits(tokenAmount, brandTokenDecimals)
      const requiredStableAmount = ethers.parseUnits(stableAmount, stablecoinDecimals)
      const minLpAmountWei = ethers.parseUnits(minLpAmount, 18) // LP tokens are always 18 decimals

      // Get contract address
      const contractAddress = await this.getContractAddress()

      // Encode the function call
      const calldata = this.contract.interface.encodeFunctionData('addLiquidity', [
        requiredTokenAmount,
        requiredStableAmount,
        minLpAmountWei,
        sender,
      ])

      this.logger.log('Generated add liquidity calldata successfully')
      return {
        calldata,
        contractAddress,
      }
    } catch (error) {
      this.logger.error('Failed to get add liquidity calldata:', error.message)
      throw new PoolError(
        `Failed to get add liquidity calldata: ${error.message}`,
        'GET_CALLDATA_FAILED',
        {
          originalError: error.message,
          stack: error.stack,
        },
      )
    }
  }
}
