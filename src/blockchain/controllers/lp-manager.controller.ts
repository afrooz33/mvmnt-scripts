import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { LPManagerService } from '../services/lp-manager.service'
import {
  CreatePoolDto,
  AddLiquidityDto,
  RemoveLiquidityDto,
  SwapDto,
  ClaimFeesDto,
} from '../dto/lp-manager.dto'
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/auth/guards/roles.guard'
import { Roles } from '../../shared/auth/decorators/roles.decorator'
import { Role } from '../../shared/enums'

@ApiTags('LP Manager')
@Controller('lp-manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.MANAGER)
@ApiBearerAuth()
export class LPManagerController {
  constructor(private readonly lpManagerService: LPManagerService) {}

  @Post('pools')
  @ApiOperation({
    summary: 'Create a new pool for a brand token',
    description:
      'Creates a new liquidity pool for the specified brand token. This allows users to provide liquidity and trade the token.',
  })
  @ApiBody({ type: CreatePoolDto })
  @ApiResponse({
    status: 201,
    description: 'Pool created successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        poolAddress: { type: 'string', example: '0x1234...5678' },
        transactionHash: { type: 'string', example: '0x9876...5432' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Pool Already Exists or Invalid Request',
    schema: {
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        poolAddress: { type: 'string' },
        tokenReserve: { type: 'string' },
        stableReserve: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createPool(@Body() createPoolDto: CreatePoolDto) {
    try {
      const result = await this.lpManagerService.createPool(createPoolDto.brandId)

      // If pool already exists, return 400 status with pool details
      if (!result.success && result.message === 'Pool already exists') {
        throw new HttpException(
          {
            success: false,
            message: `Pool already exists for brand ${createPoolDto.brandId}`,
            poolAddress: result.poolAddress,
            tokenReserve: result.tokenReserve,
            stableReserve: result.stableReserve,
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      // If successful, return 201 Created status
      return {
        success: true,
        message: 'Pool created successfully',
        poolAddress: result.poolAddress,
        transactionHash: result.transactionHash,
      }
    } catch (error) {
      // If it's already a HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error
      }

      // If it's a contract error, return 400 Bad Request
      if (error.message.startsWith('Contract error:')) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      // For all other errors, return 500 Internal Server Error
      throw new HttpException(
        {
          success: false,
          message: `Internal server error: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('pools/:brandId')
  @ApiOperation({
    summary: 'Get pool information',
    description:
      'Retrieves detailed information about a specific liquidity pool including token reserves and stable coin reserves.',
  })
  @ApiParam({
    name: 'brandId',
    description: 'Unique identifier of the brand',
    example: 'brand-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Pool information retrieved successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            poolAddress: { type: 'string', example: '0x1234...5678' },
            tokenReserve: { type: 'string', example: '1000000000000000000' },
            stableReserve: { type: 'string', example: '1000000000000000000' },
          },
        },
      },
    },
  })
  async getPool(@Param('brandId') brandId: string) {
    try {
      const result = await this.lpManagerService.getPool(brandId)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('liquidity/add')
  @ApiOperation({
    summary: 'Add liquidity to a pool',
    description:
      'Adds liquidity to a specific pool by providing both brand tokens and stablecoins. Returns LP tokens representing the share in the pool.',
  })
  @ApiBody({ type: AddLiquidityDto })
  @ApiResponse({
    status: 201,
    description: 'Liquidity added successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        lpAmount: { type: 'string', example: '990000000000000000' },
        transactionHash: { type: 'string', example: '0x9876...5432' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Contract error or invalid parameters',
    schema: {
      properties: {
        success: { type: 'boolean' },
        code: { type: 'string' },
        reason: { type: 'string' },
        message: { type: 'string' },
        details: {
          type: 'object',
          properties: {
            brandId: { type: 'string' },
            tokenAmount: { type: 'string' },
            stableAmount: { type: 'string' },
            minLpAmount: { type: 'string' },
          },
        },
      },
    },
  })
  async addLiquidity(@Body() addLiquidityDto: AddLiquidityDto) {
    try {
      // Validate decimal string inputs
      const decimalRegex = /^[0-9]+\.?[0-9]*$/
      if (
        !decimalRegex.test(addLiquidityDto.tokenAmount) ||
        !decimalRegex.test(addLiquidityDto.stableAmount) ||
        !decimalRegex.test(addLiquidityDto.minLpAmount)
      ) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid decimal string format',
            details: {
              brandId: addLiquidityDto.brandId,
              tokenAmount: addLiquidityDto.tokenAmount,
              stableAmount: addLiquidityDto.stableAmount,
              minLpAmount: addLiquidityDto.minLpAmount,
            },
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      const result = await this.lpManagerService.addLiquidity(
        addLiquidityDto.brandId,
        addLiquidityDto.tokenAmount,
        addLiquidityDto.stableAmount,
        addLiquidityDto.minLpAmount,
      )

      return result
    } catch (error) {
      // If it's already a formatted error from the service, pass it through
      if (error.success === false) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST)
      }

      // For unexpected errors, return a 500
      throw new HttpException(
        {
          success: false,
          message: 'Internal server error',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('liquidity/remove')
  @ApiOperation({
    summary: 'Remove liquidity from a pool',
    description:
      'Removes liquidity from a specific pool by burning LP tokens. Returns both brand tokens and stablecoins.',
  })
  @ApiBody({ type: RemoveLiquidityDto })
  @ApiResponse({
    status: 200,
    description: 'Liquidity removed successfully',
    schema: {
      properties: {
        tokenAmount: { type: 'string', example: '990000000000000000' },
        stableAmount: { type: 'string', example: '990000000000000000' },
        transactionHash: { type: 'string', example: '0x9876...5432' },
      },
    },
  })
  async removeLiquidity(@Body() removeLiquidityDto: RemoveLiquidityDto) {
    return this.lpManagerService.removeLiquidity(
      removeLiquidityDto.brandId,
      removeLiquidityDto.lpAmount,
      removeLiquidityDto.minTokenAmount,
      removeLiquidityDto.minStableAmount,
    )
  }

  @Post('swap')
  @ApiOperation({
    summary: 'Swap tokens',
    description:
      'Execute a token swap in the pool. Can either buy brand tokens with stablecoins or sell brand tokens for stablecoins.',
  })
  @ApiBody({ type: SwapDto })
  @ApiResponse({
    status: 200,
    description: 'Swap executed successfully',
    schema: {
      properties: {
        amountOut: { type: 'string', example: '990000000000000000' },
        transactionHash: { type: 'string', example: '0x9876...5432' },
      },
    },
  })
  async swap(@Body() swapDto: SwapDto) {
    return this.lpManagerService.swap(
      swapDto.brandId,
      swapDto.isBuyToken,
      swapDto.amountIn,
      swapDto.minAmountOut,
    )
  }

  @Get('quote')
  @ApiOperation({
    summary: 'Get quote for token swap',
    description:
      'Calculate the expected output amount for a token swap without executing the transaction.',
  })
  @ApiQuery({
    name: 'brandId',
    description: 'Unique identifier of the brand',
    example: 'brand-123',
  })
  @ApiQuery({
    name: 'isBuyToken',
    description: 'True if buying brand token, false if selling',
    example: true,
  })
  @ApiQuery({
    name: 'amountIn',
    description: 'Amount of input tokens',
    example: '1000000000000000000',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote retrieved successfully',
    schema: {
      type: 'string',
      example: '990000000000000000',
    },
  })
  async getQuote(
    @Query('brandId') brandId: string,
    @Query('isBuyToken') isBuyToken: boolean,
    @Query('amountIn') amountIn: string,
  ) {
    return this.lpManagerService.getAmountOut(brandId, isBuyToken, amountIn)
  }

  @Get('fees/:brandId/:userAddress')
  @ApiOperation({
    summary: 'Get pending fees for a user',
    description:
      'Retrieves all pending fees for a user across different fee types (LP provider, LP staker, BT staker).',
  })
  @ApiParam({
    name: 'brandId',
    description: 'Unique identifier of the brand',
    example: 'brand-123',
  })
  @ApiParam({
    name: 'userAddress',
    description: 'Ethereum address of the user',
    example: '0x1234...5678',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending fees retrieved successfully',
    schema: {
      properties: {
        lpProviderFees: { type: 'string', example: '1000000000000000000' },
        lpStakerFees: { type: 'string', example: '500000000000000000' },
        btStakerFees: { type: 'string', example: '300000000000000000' },
      },
    },
  })
  async getPendingFees(
    @Param('brandId') brandId: string,
    @Param('userAddress') userAddress: string,
  ) {
    return this.lpManagerService.getPendingFees(brandId, userAddress)
  }

  @Post('fees/claim')
  @ApiOperation({
    summary: 'Claim fees',
    description:
      'Claims the pending fees for a specific fee type (LP provider, LP staker, or BT staker).',
  })
  @ApiBody({ type: ClaimFeesDto })
  @ApiResponse({
    status: 200,
    description: 'Fees claimed successfully',
    schema: {
      properties: {
        amount: { type: 'string', example: '1000000000000000000' },
        transactionHash: { type: 'string', example: '0x9876...5432' },
      },
    },
  })
  async claimFees(@Body() claimFeesDto: ClaimFeesDto) {
    return this.lpManagerService.claimFees(claimFeesDto.brandId, claimFeesDto.feeType)
  }
}
