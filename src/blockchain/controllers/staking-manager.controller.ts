import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { StakingManagerService } from '../services/staking-manager.service'
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/auth/guards/roles.guard'
import { Roles } from '../../shared/auth/decorators/roles.decorator'
import { Role } from '../../shared/enums'
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsUUID,
  Min,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

// DTOs for request/response objects
export class SetStakingConfigDto {
  @ApiProperty({ description: 'Brand ID in UUID format' })
  @IsNotEmpty()
  @IsUUID()
  brandId: string

  @ApiProperty({
    description: 'Base reward rate in wei (as string)',
    example: '1000000000000000000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'baseRewardRate must be a numeric string representing wei value' })
  baseRewardRate: string

  @ApiProperty({
    description: 'Bonus reward rate in wei (as string)',
    example: '500000000000000000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'bonusRewardRate must be a numeric string representing wei value' })
  bonusRewardRate: string

  @ApiProperty({ description: 'Maximum lock period in seconds', example: 31536000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  maxLockPeriod: number

  @ApiProperty({
    description: 'Minimum stake amount in wei (as string)',
    example: '1000000000000000000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'minStakeAmount must be a numeric string representing wei value' })
  minStakeAmount: string
}

export class StakeTokensDto {
  @ApiProperty({ description: 'Brand ID in UUID format' })
  @IsNotEmpty()
  @IsUUID()
  brandId: string

  @ApiProperty({
    description: 'Amount to stake in wei (as string)',
    example: '1000000000000000000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'amount must be a numeric string representing wei value' })
  amount: string

  @ApiProperty({ description: 'Lock period in days', example: 30 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  lockPeriodDays: number
}

export class UnstakeTokensDto {
  @ApiProperty({ description: 'Brand ID in UUID format' })
  @IsNotEmpty()
  @IsUUID()
  brandId: string

  @ApiProperty({ description: 'Stake ID to unstake', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stakeId: number
}

export class CanStakeQueryDto {
  @ApiProperty({ description: 'Brand ID in UUID format' })
  @IsNotEmpty()
  @IsUUID()
  brandId: string

  @ApiProperty({
    description: 'Amount to stake in wei (as string)',
    example: '1000000000000000000',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'amount must be a numeric string representing wei value' })
  amount: string

  @ApiProperty({ description: 'User wallet address' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  userAddress: string

  @ApiPropertyOptional({ description: 'Whether staking LP tokens', default: false })
  @IsOptional()
  @IsBoolean()
  isLPToken?: boolean
}

@ApiTags('Staking Manager')
@Controller('blockchain/staking-manager')
export class StakingManagerController {
  constructor(private readonly stakingManagerService: StakingManagerService) {}

  @Post('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Set staking configuration for a brand',
    description:
      'Sets the staking configuration parameters for a specific brand. Requires admin role.',
  })
  @ApiBody({ type: SetStakingConfigDto })
  @ApiResponse({
    status: 201,
    description: 'Staking configuration set successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        transactionHash: { type: 'string', example: '0x123...' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters or contract error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have admin role',
  })
  async setStakingConfig(@Body() config: SetStakingConfigDto) {
    try {
      // Validate wei values are proper format
      if (!this.isValidWeiValue(config.baseRewardRate)) {
        throw new HttpException('Invalid baseRewardRate format', HttpStatus.BAD_REQUEST)
      }
      if (!this.isValidWeiValue(config.bonusRewardRate)) {
        throw new HttpException('Invalid bonusRewardRate format', HttpStatus.BAD_REQUEST)
      }
      if (!this.isValidWeiValue(config.minStakeAmount)) {
        throw new HttpException('Invalid minStakeAmount format', HttpStatus.BAD_REQUEST)
      }

      // Log the incoming request
      console.log('[StakingManagerController] Setting staking config:', {
        brandId: config.brandId,
        baseRewardRate: config.baseRewardRate,
        bonusRewardRate: config.bonusRewardRate,
        maxLockPeriod: config.maxLockPeriod,
        minStakeAmount: config.minStakeAmount,
      })

      const txHash = await this.stakingManagerService.setStakingConfig(
        config.brandId,
        config.baseRewardRate,
        config.bonusRewardRate,
        config.maxLockPeriod,
        config.minStakeAmount,
      )

      return {
        success: true,
        transactionHash: txHash,
      }
    } catch (error) {
      console.error('[StakingManagerController] Error setting staking config:', error)

      // Handle specific error types
      if (error instanceof HttpException) {
        throw error
      }

      // Handle contract-specific errors
      if (error.message.includes('execution reverted')) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Smart contract execution failed',
            error: error.message,
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Failed to set staking configuration',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  // Helper method to validate wei values
  private isValidWeiValue(value: string): boolean {
    try {
      // Check if the string only contains numbers
      if (!/^\d+$/.test(value)) {
        return false
      }
      // Ensure the value can be converted to BigInt
      BigInt(value)
      return true
    } catch {
      return false
    }
  }

  @Get('config/:brandId')
  @ApiOperation({
    summary: 'Get staking configuration for a brand',
    description: 'Retrieves the current staking configuration for a specific brand',
  })
  @ApiParam({
    name: 'brandId',
    description: 'Brand ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            baseRewardRate: { type: 'string', example: '1000000000000000000' },
            bonusRewardRate: { type: 'string', example: '500000000000000000' },
            maxLockPeriod: { type: 'number', example: 31536000 },
            minStakeAmount: { type: 'string', example: '1000000000000000000' },
            isPaused: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  async getStakingConfig(@Param('brandId') brandId: string) {
    try {
      const config = await this.stakingManagerService.getStakingConfig(brandId)
      return {
        success: true,
        data: config,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('stake/brand-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Stake brand tokens',
    description: 'Stakes brand tokens for a specific brand with a lock period',
  })
  @ApiBody({ type: StakeTokensDto })
  @ApiResponse({
    status: 201,
    description: 'Brand tokens staked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            transactionHash: { type: 'string', example: '0x123...' },
            blockNumber: { type: 'number', example: 12345678 },
            brandId: { type: 'string' },
            amount: { type: 'string' },
            userAddress: { type: 'string' },
            lockPeriodSeconds: { type: 'number' },
          },
        },
      },
    },
  })
  async stakeBrandTokens(@Body() stakeData: StakeTokensDto, @Request() req) {
    try {
      const userAddress = req.user?.walletAddress
      if (!userAddress) {
        throw new HttpException('Wallet address not found', HttpStatus.BAD_REQUEST)
      }

      const result = await this.stakingManagerService.stakeBrandToken(
        stakeData.brandId,
        stakeData.amount,
        stakeData.lockPeriodDays * 24 * 60 * 60, // Convert days to seconds
        userAddress,
      )
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('stake/lp-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Stake LP tokens',
    description: 'Stakes LP tokens for a specific brand with a lock period',
  })
  @ApiBody({ type: StakeTokensDto })
  @ApiResponse({
    status: 201,
    description: 'LP tokens staked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            transactionHash: { type: 'string', example: '0x123...' },
            blockNumber: { type: 'number', example: 12345678 },
            brandId: { type: 'string' },
            amount: { type: 'string' },
            userAddress: { type: 'string' },
            lockPeriodDays: { type: 'number' },
          },
        },
      },
    },
  })
  async stakeLPTokens(@Body() stakeData: StakeTokensDto, @Request() req) {
    try {
      const userAddress = req.user?.walletAddress
      if (!userAddress) {
        throw new HttpException('Wallet address not found', HttpStatus.BAD_REQUEST)
      }

      const result = await this.stakingManagerService.stakeLPToken(
        stakeData.brandId,
        stakeData.amount,
        stakeData.lockPeriodDays,
        userAddress,
      )
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('unstake')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unstake tokens' })
  @ApiResponse({ status: 201, description: 'Tokens unstaked successfully' })
  async unstake(
    @Body()
    unstakeData: {
      brandId: string
      stakeId: number
    },
    @Request() req,
  ) {
    try {
      const userAddress = req.user?.walletAddress
      if (!userAddress) {
        throw new HttpException('Wallet address not found', HttpStatus.BAD_REQUEST)
      }

      const result = await this.stakingManagerService.unstake(
        unstakeData.brandId,
        unstakeData.stakeId,
      )
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('stakes/:brandId/:userAddress')
  @ApiOperation({ summary: 'Get all stakes for a user' })
  @ApiParam({ name: 'brandId', description: 'Brand ID (UUID)' })
  @ApiParam({ name: 'userAddress', description: 'User wallet address' })
  @ApiResponse({ status: 200, description: 'User stakes retrieved successfully' })
  async getUserStakes(
    @Param('brandId') brandId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      const stakes = await this.stakingManagerService.getUserStakes(brandId, userAddress)
      return {
        success: true,
        data: stakes,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('total-staked/:brandId')
  @ApiOperation({ summary: 'Get total staked amount for a brand' })
  @ApiParam({ name: 'brandId', description: 'Brand ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Total staked amount retrieved successfully' })
  async getTotalStaked(@Param('brandId') brandId: string) {
    try {
      const totalStaked = await this.stakingManagerService.getTotalStaked(brandId)
      const totalLPStaked = await this.stakingManagerService.getTotalLPStaked(brandId)
      return {
        success: true,
        data: {
          totalBrandTokenStaked: totalStaked,
          totalLPTokenStaked: totalLPStaked,
        },
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('staked-amount/:brandId/:userAddress')
  @ApiOperation({ summary: 'Get staked amount for a user' })
  @ApiParam({ name: 'brandId', description: 'Brand ID (UUID)' })
  @ApiParam({ name: 'userAddress', description: 'User wallet address' })
  @ApiResponse({ status: 200, description: 'Staked amount retrieved successfully' })
  async getStakedAmount(
    @Param('brandId') brandId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      const brandTokenAmount = await this.stakingManagerService.getTotalUserStake(
        brandId,
        userAddress,
      )
      const lpTokenAmount = await this.stakingManagerService.getTotalUserLPStake(
        brandId,
        userAddress,
      )
      return {
        success: true,
        data: {
          brandTokenAmount,
          lpTokenAmount,
        },
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('apy/:brandId')
  @ApiOperation({ summary: 'Get current APY for a brand' })
  @ApiParam({ name: 'brandId', description: 'Brand ID (UUID)' })
  @ApiResponse({ status: 200, description: 'APY retrieved successfully' })
  async getCurrentAPY(@Param('brandId') brandId: string) {
    try {
      const apy = await this.stakingManagerService.getCurrentAPY(brandId)
      return {
        success: true,
        data: apy,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Post('update-apy/:brandId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update APY for a brand' })
  @ApiParam({ name: 'brandId', description: 'Brand ID (UUID)' })
  @ApiResponse({ status: 201, description: 'APY updated successfully' })
  async updateAPY(@Param('brandId') brandId: string) {
    try {
      const result = await this.stakingManagerService.updateAPY(brandId)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('can-stake')
  @ApiOperation({
    summary: 'Check if user can stake tokens',
    description:
      'Checks if a user can stake tokens by validating balance, allowance, and minimum stake amount',
  })
  @ApiQuery({
    name: 'brandId',
    description: 'Brand ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'amount',
    description: 'Amount to stake in wei',
    example: '1000000000000000000',
  })
  @ApiQuery({
    name: 'userAddress',
    description: 'User wallet address',
    example: '0x1234567890123456789012345678901234567890',
  })
  @ApiQuery({
    name: 'isLPToken',
    description: 'Whether staking LP tokens',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Stake possibility checked successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            canStake: { type: 'boolean', example: true },
            reason: { type: 'string', example: null },
            balance: { type: 'string', example: '2000000000000000000' },
            allowance: { type: 'string', example: '1000000000000000000' },
            minStakeAmount: { type: 'string', example: '100000000000000000' },
          },
        },
      },
    },
  })
  async canUserStake(@Query() query: CanStakeQueryDto) {
    try {
      const result = query.isLPToken
        ? await this.stakingManagerService.canUserStakeLP(
            query.brandId,
            query.userAddress,
            query.amount,
          )
        : await this.stakingManagerService.canUserStake(
            query.brandId,
            query.userAddress,
            query.amount,
          )
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Put('pause/:brandId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pause staking for a brand' })
  @ApiParam({ name: 'brandId', description: 'Brand ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Staking paused successfully' })
  async pauseBrandStaking(@Param('brandId') brandId: string) {
    try {
      const result = await this.stakingManagerService.pauseBrandStaking(brandId)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Put('unpause/:brandId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpause staking for a brand' })
  @ApiParam({ name: 'brandId', description: 'Brand ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Staking unpaused successfully' })
  async unpauseBrandStaking(@Param('brandId') brandId: string) {
    try {
      const result = await this.stakingManagerService.unpauseBrandStaking(brandId)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  @Get('contract-ownership')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contract ownership details' })
  @ApiResponse({ status: 200, description: 'Contract ownership details retrieved successfully' })
  async getContractOwnership() {
    try {
      const ownership = await this.stakingManagerService.checkContractOwnership()
      return {
        success: true,
        data: ownership,
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
