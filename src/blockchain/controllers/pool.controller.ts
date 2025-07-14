import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
  OnModuleInit,
  BadRequestException,
  InternalServerErrorException,
  UseFilters,
} from '@nestjs/common'
import { PoolService } from '../services/pool.service'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger'
import { PoolError } from '../services/pool.service'
import { PoolExceptionFilter } from '../filters/pool-exception.filter'
import { BlockchainService } from '../blockchain.service'

@ApiTags('Pool')
@Controller('pool')
@UseFilters(PoolExceptionFilter)
export class PoolController implements OnModuleInit {
  private readonly logger = new Logger(PoolController.name)

  constructor(
    private readonly poolService: PoolService,
    private readonly blockchainService: BlockchainService,
  ) {
    this.logger.log('PoolController constructor called')
  }

  onModuleInit() {
    this.logger.log('PoolController initialized')
    this.logger.log('Available endpoints:')
    this.logger.log('- GET /api/v1/pool/info')
    this.logger.log('- GET /api/v1/pool/reserves')
    this.logger.log('- GET /api/v1/pool/price')
    this.logger.log('- GET /api/v1/pool/amount-out')
    this.logger.log('- GET /api/v1/pool/balance/:address')
    this.logger.log('- GET /api/v1/pool/allowance')
    this.logger.log('- POST /api/v1/pool/add-liquidity')
    this.logger.log('- POST /api/v1/pool/remove-liquidity')
    this.logger.log('- POST /api/v1/pool/swap')
    this.logger.log('- POST /api/v1/pool/approve')
    this.logger.log('- POST /api/v1/pool/transfer')
    this.logger.log('- POST /api/v1/pool/transfer-from')
    this.logger.log('- GET /api/v1/pool/token-balance/:address')
    this.logger.log('- GET /api/v1/pool/health')
    this.logger.log('- POST /api/v1/pool/reconnect')
  }

  @Get('info')
  @ApiOperation({ summary: 'Get pool information' })
  @ApiResponse({
    status: 200,
    description: 'Pool information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            brandToken: { type: 'string', description: 'Address of the brand token' },
            stablecoin: { type: 'string', description: 'Address of the stablecoin' },
            manager: { type: 'string', description: 'Address of the pool manager' },
            brandId: { type: 'string', description: 'Brand ID' },
            fee: { type: 'string', description: 'Pool fee' },
            brandTokenDecimals: { type: 'number', description: 'Brand token decimals' },
            stablecoinDecimals: { type: 'number', description: 'Stablecoin decimals' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        code: { type: 'string' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        code: { type: 'string' },
        details: { type: 'object' },
      },
    },
  })
  async getPoolInfo() {
    try {
      this.logger.log('Getting pool info')
      const info = await this.poolService.getPoolInfo()
      this.logger.log(`Pool info retrieved successfully: ${JSON.stringify(info)}`)
      return {
        success: true,
        data: info,
      }
    } catch (error) {
      this.logger.error('Failed to get pool info:', error)
      if (error instanceof PoolError) {
        throw new BadRequestException({
          success: false,
          message: error.message,
          code: error.code,
          details: error.details,
        })
      }
      throw new InternalServerErrorException({
        success: false,
        message: `Failed to get pool info: ${error.message}`,
        code: 'POOL_INFO_ERROR',
        details: error,
      })
    }
  }

  @Get('reserves')
  @ApiOperation({ summary: 'Get pool reserves' })
  @ApiResponse({
    status: 200,
    description: 'Pool reserves retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            tokenReserve: { type: 'string', description: 'Amount of brand tokens in the pool' },
            stableReserve: { type: 'string', description: 'Amount of stablecoins in the pool' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getReserves() {
    try {
      const [tokenReserve, stableReserve] = await Promise.all([
        this.poolService.tokenReserve(),
        this.poolService.stableReserve(),
      ])
      return {
        success: true,
        data: {
          tokenReserve: tokenReserve.toString(),
          stableReserve: stableReserve.toString(),
        },
      }
    } catch (error) {
      throw new InternalServerErrorException(`Failed to get pool reserves: ${error.message}`)
    }
  }

  @Get('price')
  @ApiOperation({ summary: 'Get current pool price' })
  @ApiResponse({
    status: 200,
    description: 'Pool price retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            price: {
              type: 'string',
              description: 'Current price of the brand token in stablecoins',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPrice() {
    try {
      const price = await this.poolService.getCurrentPrice()
      return {
        success: true,
        data: {
          price: price.toString(),
        },
      }
    } catch (error) {
      throw new InternalServerErrorException(`Failed to get pool price: ${error.message}`)
    }
  }

  @Get('amount-out')
  @ApiOperation({ summary: 'Calculate swap output amount' })
  @ApiQuery({
    name: 'isBuyToken',
    type: 'boolean',
    description: 'True for buying token, false for selling',
  })
  @ApiQuery({ name: 'amountIn', type: 'string', description: 'Input amount in wei' })
  @ApiResponse({
    status: 200,
    description: 'Amount out calculated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            amountOut: { type: 'string', description: 'Output amount in wei' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAmountOut(
    @Query('isBuyToken') isBuyToken: boolean,
    @Query('amountIn') amountIn: string,
  ) {
    try {
      if (isBuyToken === undefined || !amountIn) {
        throw new BadRequestException('isBuyToken and amountIn are required')
      }

      const amountOut = await this.poolService.getAmountOut(isBuyToken, amountIn)
      return {
        success: true,
        data: {
          amountOut: amountOut.toString(),
        },
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to calculate amount out: ${error.message}`)
    }
  }

  @Post('add-liquidity')
  @ApiOperation({ summary: 'Add liquidity to the pool' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tokenAmount: { type: 'string', description: 'Amount of brand tokens to add' },
        stableAmount: { type: 'string', description: 'Amount of stablecoins to add' },
        minLpAmount: { type: 'string', description: 'Minimum amount of LP tokens to receive' },
        sender: { type: 'string', description: 'Address of the sender' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Liquidity added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            lpAmount: { type: 'string', description: 'Amount of LP tokens received' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addLiquidity(
    @Body()
    body: {
      tokenAmount: string
      stableAmount: string
      minLpAmount: string
      sender: string
    },
  ) {
    try {
      const lpAmount = await this.poolService.addLiquidity(
        body.tokenAmount,
        body.stableAmount,
        body.minLpAmount,
        body.sender,
      )
      return {
        success: true,
        data: {
          lpAmount: lpAmount.toString(),
        },
      }
    } catch (error) {
      if (error instanceof PoolError) {
        throw new BadRequestException({
          success: false,
          message: error.message,
          code: error.code,
          details: error.details,
        })
      }
      throw new InternalServerErrorException({
        success: false,
        message: `Failed to add liquidity: ${error.message}`,
        code: 'ADD_LIQUIDITY_ERROR',
        details: error,
      })
    }
  }

  @Get('add-liquidity-calldata')
  @ApiOperation({ summary: 'Get calldata for adding liquidity' })
  @ApiQuery({ name: 'tokenAmount', type: 'string', description: 'Amount of brand tokens to add' })
  @ApiQuery({ name: 'stableAmount', type: 'string', description: 'Amount of stablecoins to add' })
  @ApiQuery({
    name: 'minLpAmount',
    type: 'string',
    description: 'Minimum amount of LP tokens to receive',
  })
  @ApiQuery({ name: 'sender', type: 'string', description: 'Address of the sender' })
  @ApiResponse({
    status: 200,
    description: 'Calldata generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            calldata: { type: 'string', description: 'Encoded function call data' },
            contractAddress: { type: 'string', description: 'Address of the pool contract' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAddLiquidityCalldata(
    @Query('tokenAmount') tokenAmount: string,
    @Query('stableAmount') stableAmount: string,
    @Query('minLpAmount') minLpAmount: string,
    @Query('sender') sender: string,
  ): Promise<{ success: boolean; data: { calldata: string; contractAddress: string } }> {
    try {
      const result = await this.poolService.getAddLiquidityCalldata(
        tokenAmount,
        stableAmount,
        minLpAmount,
        sender,
      )
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      if (error instanceof PoolError) {
        throw new BadRequestException({
          success: false,
          message: error.message,
          code: error.code,
          details: error.details,
        })
      }
      throw new InternalServerErrorException({
        success: false,
        message: `Failed to get add liquidity calldata: ${error.message}`,
        code: 'GET_CALLDATA_ERROR',
        details: error,
      })
    }
  }

  @Get('balances/:address')
  @ApiOperation({ summary: 'Get token balances for address' })
  @ApiParam({ name: 'address', type: 'string', description: 'Account address' })
  @ApiResponse({
    status: 200,
    description: 'Balances retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            brandTokenBalance: { type: 'string', description: 'Brand token balance' },
            stablecoinBalance: { type: 'string', description: 'Stablecoin balance' },
            lpTokenBalance: { type: 'string', description: 'LP token balance' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid address' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBalances(@Param('address') address: string) {
    try {
      if (!address) {
        throw new BadRequestException('Address is required', 'INVALID_ADDRESS')
      }

      // Get token addresses
      const [brandToken, stablecoin] = await Promise.all([
        this.poolService.brandToken(),
        this.poolService.stablecoin(),
      ])

      // Get balances
      const [brandTokenBalance, stablecoinBalance, lpTokenBalance] = await Promise.all([
        this.poolService.getTokenBalance(brandToken, address),
        this.poolService.getTokenBalance(stablecoin, address),
        this.poolService.balanceOf(address),
      ])

      const response = {
        success: true,
        data: {
          brandTokenBalance: brandTokenBalance.toString(),
          stablecoinBalance: stablecoinBalance.toString(),
          lpTokenBalance: lpTokenBalance.toString(),
        },
      }

      this.logger.log(`Balances retrieved successfully: ${JSON.stringify(response)}`)
      return response
    } catch (error) {
      this.logger.error('Failed to get balances:', error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException('Failed to get balances', 'BALANCE_ERROR')
    }
  }

  @Get('allowance')
  @ApiOperation({ summary: 'Get token allowances' })
  @ApiQuery({ name: 'owner', type: 'string', description: 'Token owner address' })
  @ApiQuery({ name: 'spender', type: 'string', description: 'Spender address' })
  @ApiResponse({
    status: 200,
    description: 'Allowances retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            brandTokenAllowance: { type: 'string', description: 'Allowance for brand token' },
            stablecoinAllowance: { type: 'string', description: 'Allowance for stablecoin' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllowance(@Query('owner') owner: string, @Query('spender') spender: string) {
    try {
      if (!owner || !spender) {
        throw new BadRequestException('owner and spender addresses are required')
      }

      const [brandTokenAllowance, stablecoinAllowance] = await this.poolService.getTokenAllowances(
        owner,
        spender,
      )

      return {
        success: true,
        data: {
          brandTokenAllowance: brandTokenAllowance.toString(),
          stablecoinAllowance: stablecoinAllowance.toString(),
        },
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to get allowances: ${error.message}`)
    }
  }

  @Post('remove-liquidity')
  @ApiOperation({ summary: 'Remove liquidity from pool' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['lpAmount', 'minTokenAmount', 'minStableAmount'],
      properties: {
        lpAmount: {
          type: 'string',
          description: 'Amount of LP tokens to burn',
          example: '1000000000000000000000',
        },
        minTokenAmount: {
          type: 'string',
          description: 'Minimum amount of brand tokens to receive',
          example: '0',
        },
        minStableAmount: {
          type: 'string',
          description: 'Minimum amount of stablecoins to receive',
          example: '0',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Liquidity removed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            tokenAmount: { type: 'string', example: '1000000000000000000000' },
            stableAmount: { type: 'string', example: '1000000000000000000000' },
          },
        },
      },
    },
  })
  async removeLiquidity(
    @Body('lpAmount') lpAmount: string,
    @Body('minTokenAmount') minTokenAmount: string,
    @Body('minStableAmount') minStableAmount: string,
  ) {
    const [tokenAmount, stableAmount] = await this.poolService.removeLiquidity(
      lpAmount,
      minTokenAmount,
      minStableAmount,
    )
    return {
      success: true,
      data: {
        tokenAmount: tokenAmount.toString(),
        stableAmount: stableAmount.toString(),
      },
    }
  }

  @Post('swap')
  @ApiOperation({ summary: 'Swap tokens' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['isBuyToken', 'amountIn', 'minAmountOut'],
      properties: {
        isBuyToken: {
          type: 'boolean',
          description: 'True for buying token, false for selling',
          example: true,
        },
        amountIn: {
          type: 'string',
          description: 'Input amount in wei',
          example: '1000000',
        },
        minAmountOut: {
          type: 'string',
          description: 'Minimum output amount in wei',
          example: '900000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Swap executed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            amountOut: { type: 'string', description: 'Output amount in wei' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async swap(@Body() body: { isBuyToken: boolean; amountIn: string; minAmountOut: string }) {
    try {
      const { isBuyToken, amountIn, minAmountOut } = body

      if (isBuyToken === undefined || !amountIn || !minAmountOut) {
        throw new BadRequestException('All parameters are required')
      }

      const amountOut = await this.poolService.swap(isBuyToken, amountIn, minAmountOut)

      return {
        success: true,
        data: {
          amountOut: amountOut.toString(),
        },
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to execute swap: ${error.message}`)
    }
  }

  @ApiOperation({ summary: 'Transfer tokens' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient address' },
        amount: { type: 'string', description: 'Amount to transfer' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns transfer success status' })
  @Post('transfer')
  async transfer(@Body() body: { to: string; amount: string }) {
    const { to, amount } = body
    const success = await this.poolService.transfer(to, amount)
    return { success }
  }

  @ApiOperation({ summary: 'Transfer tokens from another address' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Sender address' },
        to: { type: 'string', description: 'Recipient address' },
        amount: { type: 'string', description: 'Amount to transfer' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Returns transfer success status' })
  @Post('transfer-from')
  async transferFrom(@Body() body: { from: string; to: string; amount: string }) {
    const { from, to, amount } = body
    const success = await this.poolService.transferFrom(from, to, amount)
    return { success }
  }

  @Post('approve')
  @ApiOperation({ summary: 'Approve tokens for spender' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['token', 'spender', 'amount'],
      properties: {
        token: {
          type: 'string',
          description: 'Token contract address',
          example: '0x123...',
        },
        spender: {
          type: 'string',
          description: 'Spender address',
          example: '0x456...',
        },
        amount: {
          type: 'string',
          description: 'Amount to approve in wei',
          example: '1000000000000000000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens approved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  async approve(@Body() body: { token: string; spender: string; amount: string }) {
    try {
      const { token, spender, amount } = body

      if (!token || !spender || !amount) {
        throw new BadRequestException('token, spender, and amount are required')
      }

      const success = await this.poolService.approve(token, spender, amount)
      return { success }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to approve tokens: ${error.message}`)
    }
  }

  @Get('token-balance/:address')
  @ApiOperation({ summary: 'Get TT token balance' })
  @ApiParam({ name: 'address', type: 'string', description: 'Address to check TT balance for' })
  @ApiQuery({ name: 'tokenAddress', type: 'string', description: 'Address of the token contract' })
  @ApiResponse({
    status: 200,
    description: 'Token balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            balance: { type: 'string', description: 'Token balance' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid address or token address' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTokenBalance(
    @Param('address') address: string,
    @Query('tokenAddress') tokenAddress: string,
  ) {
    try {
      if (!address || !tokenAddress) {
        throw new BadRequestException('Address and token address are required')
      }

      const balance = await this.poolService.getTokenBalance(tokenAddress, address)
      return {
        success: true,
        data: {
          balance: balance.toString(),
        },
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new InternalServerErrorException(`Failed to get token balance: ${error.message}`)
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Get pool and blockchain health status' })
  @ApiResponse({
    status: 200,
    description: 'Health status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            pool: {
              type: 'object',
              properties: {
                isConnected: { type: 'boolean' },
                address: { type: 'string' },
                brandToken: { type: 'string' },
                stablecoin: { type: 'string' },
                tokenReserve: { type: 'string' },
                stableReserve: { type: 'string' },
              },
            },
            blockchain: {
              type: 'object',
              properties: {
                isHealthy: { type: 'boolean' },
                provider: {
                  type: 'object',
                  properties: {
                    isConnected: { type: 'boolean' },
                    network: { type: 'string' },
                    chainId: { type: 'number' },
                  },
                },
                signer: {
                  type: 'object',
                  properties: {
                    isConnected: { type: 'boolean' },
                    address: { type: 'string' },
                    balance: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getHealthStatus() {
    try {
      // Get blockchain health status
      const blockchainHealth = await this.blockchainService.getHealthStatus()

      // Get pool status
      let poolStatus = {
        isConnected: false,
        address: '',
        brandToken: '',
        stablecoin: '',
        tokenReserve: '0',
        stableReserve: '0',
      }

      try {
        const [address, brandToken, stablecoin, tokenReserve, stableReserve] = await Promise.all([
          this.poolService.getContractAddress(),
          this.poolService.brandToken(),
          this.poolService.stablecoin(),
          this.poolService.tokenReserve(),
          this.poolService.stableReserve(),
        ])

        poolStatus = {
          isConnected: true,
          address,
          brandToken,
          stablecoin,
          tokenReserve: tokenReserve.toString(),
          stableReserve: stableReserve.toString(),
        }
      } catch (error) {
        this.logger.error('Failed to get pool status:', error)
      }

      return {
        success: true,
        data: {
          pool: poolStatus,
          blockchain: blockchainHealth,
        },
      }
    } catch (error) {
      this.logger.error('Health check failed:', error)
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to get health status',
        details: error.message,
      })
    }
  }

  @Post('reconnect')
  @ApiOperation({ summary: 'Attempt to reconnect to blockchain and reinitialize pool' })
  @ApiResponse({ status: 200, description: 'Reconnection attempt status' })
  async attemptReconnect() {
    try {
      // Try to reconnect blockchain service
      const blockchainReconnected = await this.blockchainService.reconnect()

      // Try to reinitialize pool contract
      let poolReconnected = false
      if (blockchainReconnected) {
        try {
          await this.onModuleInit()
          poolReconnected = true
        } catch (error) {
          this.logger.error('Failed to reinitialize pool:', error)
        }
      }

      return {
        success: true,
        data: {
          blockchainReconnected,
          poolReconnected,
          status: poolReconnected
            ? 'Fully reconnected'
            : blockchainReconnected
              ? 'Blockchain reconnected, pool failed'
              : 'Reconnection failed',
        },
      }
    } catch (error) {
      this.logger.error('Reconnection attempt failed:', error)
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to reconnect',
        details: error.message,
      })
    }
  }
}
