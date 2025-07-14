import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  HttpStatus,
  HttpException,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger'
import { PerkNFTService } from '../services/perkNFT.service'
import {
  MintPerkNFTDto,
  TransferPerkNFTDto,
  SetApprovalDto,
  UpdatePerkManagerDto,
  UsePerkDto,
  BatchBalanceDto,
  UpdateBaseURIDto,
} from '../interfaces/perkNFT.interfaces'

/**
 * Controller for handling PerkNFT operations
 * Manages NFT minting, burning, transfers, and metadata operations
 */
@ApiTags('PerkNFT')
@Controller('blockchain/perkNFT')
export class PerkNFTController {
  private readonly logger = new Logger(PerkNFTController.name)

  constructor(private readonly perkNFTService: PerkNFTService) {}

  /**
   * Mint a new perk NFT
   */
  @Post('mint')
  @ApiOperation({
    summary: 'Mint a new perk NFT',
    description: 'Creates a new perk NFT with specified parameters',
  })
  @ApiBody({ type: MintPerkNFTDto })
  @ApiResponse({
    status: 201,
    description: 'Perk NFT minted successfully',
    schema: {
      example: {
        success: true,
        data: {
          success: true,
          tokenId: '12345',
          transactionHash: '0x1234567890abcdef...',
          blockNumber: 12345,
          gasUsed: '150000',
          status: 1,
          brandId: '16784759589448496078399208605526298889',
          perkId: '0',
          recipient: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
        },
        message: 'Perk NFT minted successfully',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async mintPerk(@Body() mintDto: MintPerkNFTDto) {
    try {
      this.logger.log(`Minting perk NFT for brand: ${mintDto.brandId}, perk: ${mintDto.perkId}`)

      const result = await this.perkNFTService.mintPerk(mintDto)

      return {
        success: true,
        data: result,
        message: 'Perk NFT minted successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to mint perk NFT')
    }
  }

  /**
   * Burn a perk NFT
   */
  @Delete('burn/:tokenId')
  @ApiOperation({
    summary: 'Burn a perk NFT',
    description: 'Permanently destroys a perk NFT',
  })
  @ApiParam({ name: 'tokenId', description: 'Token ID to burn', example: '1' })
  @ApiResponse({ status: 200, description: 'Perk NFT burned successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async burnPerk(@Param('tokenId') tokenId: string) {
    try {
      this.logger.log(`Burning perk NFT with tokenId: ${tokenId}`)

      const result = await this.perkNFTService.burnPerk(tokenId)

      return {
        success: true,
        data: result,
        message: 'Perk NFT burned successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to burn perk NFT')
    }
  }

  /**
   * Use a perk NFT
   */
  @Post('use/:tokenId')
  @ApiOperation({
    summary: 'Use a perk NFT',
    description: 'Attempts to use a perk NFT directly through the smart contract',
  })
  @ApiParam({ name: 'tokenId', description: 'The ID of the perk NFT to use' })
  @ApiBody({ type: UsePerkDto })
  @ApiResponse({ status: 200, description: 'Perk NFT usage attempt completed' })
  @ApiResponse({ status: 400, description: 'Invalid parameters or smart contract error' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async usePerk(@Param('tokenId') tokenId: string, @Body() useDto: UsePerkDto) {
    try {
      this.logger.log(`Attempting to use perk NFT with tokenId: ${tokenId}`)

      const result = await this.perkNFTService.usePerk(tokenId, useDto)

      // Return raw smart contract response
      return {
        success: result.success,
        data: result,
        message: result.success
          ? 'Smart contract transaction completed'
          : 'Smart contract transaction failed',
      }
    } catch (error) {
      this.handleError(error, 'Failed to process perk NFT usage')
    }
  }

  /**
   * Use a perk NFT with user wallet
   */
  @Post('use-with-wallet/:tokenId')
  @ApiOperation({
    summary: 'Use a perk NFT with user wallet',
    description: 'Uses a perk NFT with the actual user wallet that owns it',
  })
  @ApiParam({ name: 'tokenId', description: 'The ID of the perk NFT to use' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userPrivateKey: {
          type: 'string',
          description: 'User wallet private key',
          example: '0x1234567890abcdef...',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Perk NFT used successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters or user does not own perk' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async usePerkWithWallet(
    @Param('tokenId') tokenId: string,
    @Body() body: { userPrivateKey: string },
  ) {
    try {
      this.logger.log(`Using perk NFT with tokenId: ${tokenId} using user wallet`)

      const result = await this.perkNFTService.usePerkWithUserWallet(tokenId, body.userPrivateKey)

      return {
        success: true,
        data: result,
        message: 'Perk NFT used successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to use perk NFT with user wallet')
    }
  }

  /**
   * Transfer a perk NFT
   */
  @Post('transfer')
  @ApiOperation({
    summary: 'Transfer a perk NFT',
    description: 'Safely transfers a perk NFT from one address to another',
  })
  @ApiBody({ type: TransferPerkNFTDto })
  @ApiResponse({ status: 200, description: 'Perk NFT transferred successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transfer parameters' })
  @ApiResponse({ status: 403, description: 'Not authorized to transfer' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async transferPerk(@Body() transferDto: TransferPerkNFTDto) {
    try {
      this.logger.log(`Transferring perk NFT tokenId: ${transferDto.tokenId}`)

      const result = await this.perkNFTService.safeTransferFrom(transferDto)

      return {
        success: true,
        data: result,
        message: 'Perk NFT transferred successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to transfer perk NFT')
    }
  }

  /**
   * Set approval for user wallet
   */
  @Post('set-user-approval')
  @ApiOperation({
    summary: 'Set approval for user wallet',
    description: 'Sets approval for a user wallet to allow an operator to manage their tokens',
  })
  @ApiBody({ type: SetApprovalDto })
  @ApiResponse({ status: 200, description: 'Approval set successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async setUserWalletApproval(@Body() approvalDto: SetApprovalDto): Promise<any> {
    try {
      this.logger.log(
        `Setting approval for user wallet: ${approvalDto.operator}, approved: ${approvalDto.approved}`,
      )
      const result = await this.perkNFTService.setUserWalletApproval(
        approvalDto.operator,
        approvalDto.approved,
      )
      return {
        success: true,
        data: result,
        message: 'Approval set successfully',
      }
    } catch (error) {
      this.logger.error(`Failed to set user wallet approval: ${error.message}`)
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to set user wallet approval',
          message: error.message || 'Please try again',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Check if operator is approved for all
   */
  @Get('is-approved/:owner/:operator')
  @ApiOperation({
    summary: 'Check if operator is approved',
    description: 'Checks if an operator is approved to manage all tokens for an owner',
  })
  @ApiParam({
    name: 'owner',
    description: 'Owner address',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @ApiParam({
    name: 'operator',
    description: 'Operator address',
    example: '0x742d35Cc6629C0532C9E2A60f1e81C33DDE4e19A',
  })
  @ApiResponse({ status: 200, description: 'Approval status retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async isApprovedForAll(@Param('owner') owner: string, @Param('operator') operator: string) {
    try {
      const isApproved = await this.perkNFTService.isApprovedForAll(owner, operator)

      return {
        success: true,
        data: { isApproved },
        message: 'Approval status retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to check approval status')
    }
  }

  /**
   * Get complete perk information
   */
  @Get('info/:tokenId')
  @ApiOperation({
    summary: 'Get perk information',
    description: 'Retrieves complete information about a perk NFT including core and detail data',
  })
  @ApiParam({ name: 'tokenId', description: 'Token ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Perk information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPerkInfo(@Param('tokenId') tokenId: string) {
    try {
      const perkInfo = await this.perkNFTService.getPerkInfo(tokenId)

      return {
        success: true,
        data: perkInfo,
        message: 'Perk information retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to get perk information')
    }
  }

  /**
   * Get remaining uses for a perk
   */
  @Get('remaining-uses/:tokenId')
  @ApiOperation({
    summary: 'Get remaining uses',
    description: 'Gets the number of remaining uses for a perk NFT',
  })
  @ApiParam({ name: 'tokenId', description: 'Token ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Remaining uses retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRemainingUses(@Param('tokenId') tokenId: string) {
    try {
      const remainingUses = await this.perkNFTService.getRemainingUses(tokenId)

      return {
        success: true,
        data: { remainingUses },
        message: 'Remaining uses retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to get remaining uses')
    }
  }

  /**
   * Check if perk is valid
   */
  @Get('is-valid/:tokenId/:userWallet')
  @ApiOperation({
    summary: 'Check if perk is valid',
    description: 'Checks if a perk NFT is valid and can be used',
  })
  @ApiParam({ name: 'tokenId', description: 'Token ID', example: '1' })
  @ApiParam({
    name: 'userWallet',
    description: 'User wallet address',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @ApiResponse({ status: 200, description: 'Perk validity check completed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async isPerkValid(@Param('tokenId') tokenId: string, @Param('userWallet') userWallet: string) {
    try {
      const isValid = await this.perkNFTService.isPerkValid(tokenId, userWallet)

      return {
        success: true,
        data: { isValid },
        message: 'Perk validity check completed',
      }
    } catch (error) {
      this.handleError(error, 'Failed to check perk validity')
    }
  }

  /**
   * Get token metadata URI
   */
  @Get('metadata/:tokenId')
  @ApiOperation({
    summary: 'Get token metadata URI',
    description: 'Gets the metadata URI for a perk NFT token',
  })
  @ApiParam({ name: 'tokenId', description: 'Token ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Token URI retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTokenURI(@Param('tokenId') tokenId: string) {
    try {
      const uri = await this.perkNFTService.getTokenURI(tokenId)

      return {
        success: true,
        data: { uri },
        message: 'Token URI retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to get token URI')
    }
  }

  /**
   * Get balance of address for specific token
   */
  @Get('balance/:address/:tokenId')
  @ApiOperation({
    summary: 'Get token balance',
    description: 'Gets the balance of a specific token for an address',
  })
  @ApiParam({
    name: 'address',
    description: 'Wallet address',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @ApiParam({ name: 'tokenId', description: 'Token ID', example: '1' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBalance(@Param('address') address: string, @Param('tokenId') tokenId: string) {
    try {
      const balance = await this.perkNFTService.balanceOf(address, tokenId)

      return {
        success: true,
        data: { balance },
        message: 'Balance retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to get balance')
    }
  }

  /**
   * Check if user has claimed a specific perk
   */
  @Get('has-claimed/:perkId/:userAddress')
  @ApiOperation({
    summary: 'Check if user has claimed perk',
    description: 'Checks if a user has already claimed a specific perk',
  })
  @ApiParam({ name: 'perkId', description: 'Perk ID', example: '0' })
  @ApiParam({
    name: 'userAddress',
    description: 'User wallet address',
    example: '0x45b95E19dCBB82574221A32CB83483A3278F737f',
  })
  @ApiResponse({ status: 200, description: 'Claim status retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async hasClaimedPerk(@Param('perkId') perkId: string, @Param('userAddress') userAddress: string) {
    try {
      const hasClaimed = await this.perkNFTService.hasClaimedPerk(perkId, userAddress)

      return {
        success: true,
        data: { hasClaimed },
        message: 'Claim status retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to check claim status')
    }
  }

  /**
   * Update perk manager address (Admin only)
   */
  @Put('perk-manager')
  @ApiOperation({
    summary: 'Update perk manager',
    description: 'Updates the perk manager contract address (Admin only)',
  })
  @ApiBody({ type: UpdatePerkManagerDto })
  @ApiResponse({ status: 200, description: 'Perk manager updated successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updatePerkManager(@Body() perkManagerDto: UpdatePerkManagerDto) {
    try {
      this.logger.log(`Updating perk manager to: ${perkManagerDto.perkManager}`)

      const result = await this.perkNFTService.setPerkManager(perkManagerDto)

      return {
        success: true,
        data: result,
        message: 'Perk manager updated successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to update perk manager')
    }
  }

  /**
   * Pause contract operations (Admin only)
   */
  @Post('pause')
  @ApiOperation({
    summary: 'Pause contract',
    description: 'Pauses all contract operations (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Contract paused successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async pauseContract() {
    try {
      this.logger.log('Pausing PerkNFT contract')

      const result = await this.perkNFTService.pauseContract()

      return {
        success: true,
        data: result,
        message: 'Contract paused successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to pause contract')
    }
  }

  /**
   * Unpause contract operations (Admin only)
   */
  @Post('unpause')
  @ApiOperation({
    summary: 'Unpause contract',
    description: 'Unpauses all contract operations (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Contract unpaused successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unpauseContract() {
    try {
      this.logger.log('Unpausing PerkNFT contract')

      const result = await this.perkNFTService.unpauseContract()

      return {
        success: true,
        data: result,
        message: 'Contract unpaused successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to unpause contract')
    }
  }

  /**
   * Get token ID for a brand's perk
   */
  @Get('token-id/:brandId/:perkId')
  @ApiOperation({
    summary: 'Get token ID for brand perk',
    description: 'Gets the token ID for a specific brand and perk combination',
  })
  @ApiParam({
    name: 'brandId',
    description: 'Brand ID',
    example: '257418421373294684415119313125885331597',
  })
  @ApiParam({ name: 'perkId', description: 'Perk ID', example: '0' })
  @ApiResponse({ status: 200, description: 'Token ID retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTokenIdForPerk(@Param('brandId') brandId: string, @Param('perkId') perkId: string) {
    try {
      const tokenId = await this.perkNFTService.getTokenIdForPerk(brandId, perkId)

      return {
        success: true,
        data: { tokenId },
        message: 'Token ID retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to get token ID')
    }
  }

  /**
   * Get batch balances
   */
  @Post('batch-balance')
  @ApiOperation({
    summary: 'Get batch balances',
    description: 'Gets balances for multiple addresses and token IDs',
  })
  @ApiBody({ type: BatchBalanceDto })
  @ApiResponse({ status: 200, description: 'Batch balances retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getBatchBalances(@Body() batchDto: BatchBalanceDto) {
    try {
      const balances = await this.perkNFTService.balanceOfBatch(batchDto)

      return {
        success: true,
        data: { balances },
        message: 'Batch balances retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to get batch balances')
    }
  }

  /**
   * Update base URI (Admin only)
   */
  @Put('base-uri')
  @ApiOperation({
    summary: 'Update base URI',
    description: 'Updates the base URI for token metadata (Admin only)',
  })
  @ApiBody({ type: UpdateBaseURIDto })
  @ApiResponse({ status: 200, description: 'Base URI updated successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized - Admin only' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateBaseURI(@Body() baseURIDto: UpdateBaseURIDto) {
    try {
      this.logger.log(`Updating base URI to: ${baseURIDto.baseURI}`)

      const result = await this.perkNFTService.setBaseURI(baseURIDto)

      return {
        success: true,
        data: result,
        message: 'Base URI updated successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to update base URI')
    }
  }

  /**
   * Validate perk usage (Debug endpoint)
   */
  @Post('validate-usage/:tokenId')
  @ApiOperation({
    summary: 'Validate perk usage without executing',
    description: 'Checks if a perk can be used without actually using it',
  })
  @ApiParam({ name: 'tokenId', description: 'The ID of the perk NFT to validate' })
  @ApiBody({ type: UsePerkDto })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  async validatePerkUsage(@Param('tokenId') tokenId: string, @Body() useDto: UsePerkDto) {
    try {
      this.logger.log(`Validating perk usage for tokenId: ${tokenId}`)

      // Get perk info
      const perkInfo = await this.perkNFTService.getPerkInfo(tokenId)

      // Check balance
      const balance = await this.perkNFTService.balanceOf(useDto.userWallet, tokenId)

      // Check if valid
      const isValid = await this.perkNFTService.isPerkValid(tokenId, useDto.userWallet)

      // Get remaining uses
      const remainingUses = await this.perkNFTService.getRemainingUses(tokenId)

      return {
        success: true,
        data: {
          tokenId,
          userWallet: useDto.userWallet,
          balance,
          isValid,
          remainingUses,
          perkInfo,
          canUse: balance !== '0' && isValid,
          currentTime: Math.floor(Date.now() / 1000),
        },
        message: 'Perk validation completed',
      }
    } catch (error) {
      this.handleError(error, 'Failed to validate perk usage')
    }
  }

  /**
   * Helper method to handle errors consistently
   */
  private handleError(error: any, defaultMessage: string): never {
    this.logger.error(`${defaultMessage}: ${error.message}`)
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: defaultMessage,
        message: error.message || 'Please try again',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}
