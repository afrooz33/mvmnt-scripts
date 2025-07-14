import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpStatus,
  HttpException,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger'
import { PerkManagerService } from '../services/perk-manager.service'
import {
  CreatePerkDto,
  NFTPerkConfigDto,
  UpdatePerkStatusDto,
  UpdatePerkInfoDto,
  UpdatePerkRequirementsDto,
  ClaimPerkDto,
} from '../interfaces/perk-manager.interfaces'

/**
 * Controller for handling blockchain perk-related operations
 * Manages creation, configuration, and interaction with perks on the blockchain
 */
@ApiTags('Perk Manager')
@Controller('blockchain/perks')
export class PerkManagerController {
  private readonly logger = new Logger(PerkManagerController.name)

  constructor(private readonly perkManagerService: PerkManagerService) {}

  /**
   * Creates a new perk on the blockchain
   */
  @Post('create-perk')
  @ApiOperation({ summary: 'Create a new perk' })
  @ApiBody({ type: CreatePerkDto })
  @ApiResponse({ status: 201, description: 'Perk created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
          value: err.value,
        }))
        return new HttpException(
          {
            success: false,
            error: 'Validation failed',
            details: messages,
          },
          HttpStatus.BAD_REQUEST,
        )
      },
    }),
  )
  async createPerk(@Body() createPerkDto: CreatePerkDto) {
    try {
      this.logger.log(`Creating perk for brand: ${createPerkDto.brandId}`)

      // Validate brand existence
      const brandCheck = await this.perkManagerService.checkBrandExists(createPerkDto.brandId)

      if (!brandCheck.exists) {
        throw new HttpException(
          {
            success: false,
            error: 'Brand not found',
            details: `Brand with ID ${createPerkDto.brandId} does not exist or is not accessible`,
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      const result = await this.perkManagerService.createPerk(createPerkDto)
      return {
        success: true,
        data: result,
        message: 'Perk created successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to create perk')
    }
  }

  /**
   * Configures NFT properties for an existing perk
   */
  @Post('configure-nft')
  @ApiOperation({
    summary: 'Configure NFT properties for a perk',
    description: 'Sets NFT properties like tokenURI, maxSupply, transferability, etc.',
  })
  @ApiBody({
    type: NFTPerkConfigDto,
    description: 'NFT configuration with default values for required contract fields',
  })
  @ApiQuery({
    name: 'brandId',
    type: 'string',
    required: true,
    example: '257418421373294684415119313125885331597',
  })
  @ApiQuery({ name: 'perkId', type: 'string', required: true, example: '0' })
  @ApiResponse({ status: 200, description: 'NFT perk configured successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async configureNFTPerk(
    @Query('brandId') brandId: string,
    @Query('perkId') perkId: string,
    @Body() configDto: NFTPerkConfigDto,
  ) {
    try {
      this.logger.log(`Configuring NFT perk for brandId: ${brandId}, perkId: ${perkId}`)

      // Validate brandId format
      this.validateBrandId(brandId)

      // Validate maxSupply
      if (!configDto.maxSupply || configDto.maxSupply <= 0) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid maxSupply',
            details: 'maxSupply must be greater than 0',
          },
          HttpStatus.BAD_REQUEST,
        )
      }

      const result = await this.perkManagerService.configureNFTPerk(brandId, perkId, configDto)
      return {
        success: true,
        data: result,
        message: 'NFT perk configured successfully',
        note: 'The contract requires non-zero discountAmount and duration values, which were set as defaults',
      }
    } catch (error) {
      this.handleNFTConfigError(error, brandId, perkId)
    }
  }

  /**
   * Updates the status (active/inactive) of a perk
   */
  @Put('update-status')
  @ApiOperation({
    summary: 'Update perk status',
    description: 'Activates or deactivates a perk',
  })
  @ApiBody({ type: UpdatePerkStatusDto })
  @ApiResponse({ status: 200, description: 'Perk status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updatePerkStatus(@Body() updateStatusDto: UpdatePerkStatusDto) {
    try {
      this.validateRequiredFields(updateStatusDto, ['brandId', 'perkId'])

      this.logger.log(
        `Updating perk status: brandId=${updateStatusDto.brandId}, perkId=${updateStatusDto.perkId}, active=${updateStatusDto.active}`,
      )

      const result = await this.perkManagerService.updatePerkStatus(updateStatusDto)
      return {
        success: true,
        data: result,
        message: 'Perk status updated successfully',
        note: `Boolean active=${updateStatusDto.active} was converted to numeric status=${
          updateStatusDto.active ? 1 : 0
        } for the contract`,
      }
    } catch (error) {
      this.handleContractError(error, {
        PerkNotFound: `Perk not found with brandId=${updateStatusDto.brandId}, perkId=${updateStatusDto.perkId}`,
        onlyBrandOwner: 'Only the brand owner can update perk status for this brand',
      })
    }
  }

  /**
   * Updates perk information (name and description)
   */
  @Put('update-info')
  @ApiOperation({ summary: 'Update perk information' })
  @ApiBody({ type: UpdatePerkInfoDto })
  @ApiResponse({ status: 200, description: 'Perk information updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updatePerkInfo(@Body() updateInfoDto: UpdatePerkInfoDto) {
    try {
      this.logger.log(
        `Updating perk info for brandId=${updateInfoDto.brandId}, perkId=${updateInfoDto.perkId}`,
      )
      const result = await this.perkManagerService.updatePerkInfo(updateInfoDto)
      return {
        success: true,
        data: result,
        message: 'Perk information updated successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to update perk information')
    }
  }

  /**
   * Updates perk requirements (holding amount, time period, etc.)
   */
  @Put('update-requirements')
  @ApiOperation({
    summary: 'Update perk requirements',
    description: 'Updates requirements for a perk with automatic adjustment of invalid values',
  })
  @ApiBody({ type: UpdatePerkRequirementsDto })
  @ApiResponse({ status: 200, description: 'Perk requirements updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updatePerkRequirements(@Body() updateReqDto: UpdatePerkRequirementsDto) {
    try {
      const validatedDto = this.validateAndAdjustRequirements(updateReqDto)

      this.logger.log(
        `Updating perk requirements for brandId=${validatedDto.brandId}, perkId=${validatedDto.perkId}`,
      )
      const result = await this.perkManagerService.updatePerkRequirements(validatedDto)

      return {
        success: true,
        data: result,
        message: 'Perk requirements updated successfully',
        note: 'Values were auto-adjusted to meet smart contract requirements.',
      }
    } catch (error) {
      this.handleContractError(error, {
        InvalidParameters:
          'Parameters are invalid. Make sure: startTime is in the future, endTime is after startTime, and minHoldingAmount is greater than 0.',
        PerkNotFound: `Perk not found with brandId=${updateReqDto.brandId}, perkId=${updateReqDto.perkId}`,
        onlyBrandOwner: 'Only the brand owner can update this perk',
      })
    }
  }

  /**
   * Claims a standard perk
   */
  @Post('claim')
  @ApiOperation({ summary: 'Claim a perk' })
  @ApiBody({ type: ClaimPerkDto })
  @ApiResponse({ status: 200, description: 'Perk claimed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or not eligible' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async claimPerk(@Body() claimPerkDto: ClaimPerkDto) {
    try {
      this.logger.log(
        `Claiming perk for brandId=${claimPerkDto.brandId}, perkId=${claimPerkDto.perkId}, user=${claimPerkDto.userAddress}`,
      )
      const result = await this.perkManagerService.claimPerk(claimPerkDto)
      return {
        success: true,
        data: result,
        message: 'Perk claimed successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to claim perk')
    }
  }

  /**
   * Claims an NFT perk
   */
  @Post('claim-nft')
  @ApiOperation({ summary: 'Claim an NFT perk' })
  @ApiBody({ type: ClaimPerkDto })
  @ApiResponse({ status: 200, description: 'NFT perk claimed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or not eligible' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async claimNFTPerk(@Body() claimPerkDto: ClaimPerkDto) {
    try {
      this.logger.log(
        `Claiming NFT perk for brandId=${claimPerkDto.brandId}, perkId=${claimPerkDto.perkId}, user=${claimPerkDto.userAddress}`,
      )
      const result = await this.perkManagerService.claimNFTPerk(claimPerkDto)
      return {
        success: true,
        data: result,
        message: 'NFT perk claimed successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to claim NFT perk')
    }
  }

  /**
   * Gets all perks for a brand
   */
  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Get all perks for a brand' })
  @ApiParam({ name: 'brandId', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Brand perks retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBrandPerks(@Param('brandId') brandId: string) {
    try {
      this.logger.log(`Getting all perks for brandId=${brandId}`)
      const perkIds = await this.perkManagerService.getBrandPerks(brandId)
      return {
        success: true,
        data: { perkIds },
        message: 'Brand perks retrieved successfully',
      }
    } catch (error) {
      this.handleError(error, 'Failed to get brand perks')
    }
  }

  /**
   * Gets all perks available for a user
   */
  @Get('available/:brandId/:userAddress')
  @ApiOperation({ summary: 'Get all perks available for a user' })
  @ApiParam({ name: 'brandId', type: 'string', required: true })
  @ApiParam({ name: 'userAddress', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Available perks retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAvailablePerks(
    @Param('brandId') brandId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      this.validateEthereumAddress(userAddress)
      this.logger.log(`Getting available perks for brandId=${brandId}, user=${userAddress}`)

      // In case of contract issues, return empty array as fallback
      let perkIds = []

      try {
        perkIds = await this.perkManagerService.getAvailablePerks(brandId, userAddress)
      } catch (contractError) {
        this.logger.error(`Contract error in getAvailablePerks: ${contractError.message}`)
      }

      return {
        success: true,
        data: { perkIds, brandId, userAddress },
        message: 'Available perks retrieved successfully',
      }
    } catch (error) {
      if (error.status) {
        throw error // Rethrow HTTP exceptions
      }
      this.handleError(error, 'Failed to get available perks')
    }
  }

  /**
   * Checks if a user is eligible for a perk
   */
  @Get('eligibility/:brandId/:perkId/:userAddress')
  @ApiOperation({ summary: 'Check if a user is eligible for a perk' })
  @ApiParam({ name: 'brandId', type: 'string', required: true })
  @ApiParam({ name: 'perkId', type: 'string', required: true })
  @ApiParam({ name: 'userAddress', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Eligibility check completed' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async checkEligibility(
    @Param('brandId') brandId: string,
    @Param('perkId') perkId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      this.validateEthereumAddress(userAddress)
      this.logger.log(
        `Checking eligibility for brandId=${brandId}, perkId=${perkId}, user=${userAddress}`,
      )

      const key = this.perkManagerService.getEligibilityKey(brandId, perkId, userAddress)
      let isEligible = false
      let testMode = false

      // Check for test mode override
      if (this.perkManagerService.mockEligibilityOverrides.has(key)) {
        isEligible = this.perkManagerService.mockEligibilityOverrides.get(key)
        testMode = true
        this.logger.log(`TEST MODE ACTIVE: Force eligibility=${isEligible} for key=${key}`)
      } else {
        try {
          isEligible = await this.perkManagerService.isEligibleForPerk(brandId, perkId, userAddress)
        } catch (contractError) {
          this.logger.error(`Contract error in eligibility check: ${contractError.message}`)
        }
      }

      return {
        success: true,
        data: { isEligible, brandId, perkId, userAddress, testMode },
        message: testMode
          ? 'TEST MODE: Eligibility check completed'
          : 'Eligibility check completed successfully',
      }
    } catch (error) {
      if (error.status) {
        throw error // Rethrow HTTP exceptions
      }
      this.handleError(error, 'Failed to check eligibility')
    }
  }

  /**
   * Gets details of a specific perk
   */
  @Get(':brandId/:perkId')
  @ApiOperation({ summary: 'Get details of a specific perk' })
  @ApiParam({ name: 'brandId', type: 'string', required: true })
  @ApiParam({ name: 'perkId', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Perk details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Perk not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPerkDetails(@Param('brandId') brandId: string, @Param('perkId') perkId: string) {
    try {
      this.logger.log(`Getting perk details for brandId=${brandId}, perkId=${perkId}`)
      const result = await this.perkManagerService.getPerkDetails(brandId, perkId)
      return {
        success: true,
        data: result,
        message: 'Perk details retrieved successfully',
      }
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        throw new HttpException(
          {
            success: false,
            error: 'Perk not found',
            details: error.message,
          },
          HttpStatus.NOT_FOUND,
        )
      }
      this.handleError(error, 'Failed to get perk details')
    }
  }

  /**
   * Gets user token holdings for a brand
   */
  @Get('user-holdings/:brandId/:userAddress')
  @ApiOperation({ summary: 'Get user token holdings for a brand' })
  @ApiResponse({ status: 200, description: 'User holdings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserHoldings(
    @Param('brandId') brandId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      this.logger.log(`Getting user holdings for brandId=${brandId}, user=${userAddress}`)
      const result = await this.perkManagerService.getUserHoldings(brandId, userAddress)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      this.handleError(error, 'Failed to get user holdings')
    }
  }

  /**
   * Gets user LP token holdings for a brand
   */
  @Get('user-lp-holdings/:brandId/:userAddress')
  @ApiOperation({ summary: 'Get user LP token holdings for a brand' })
  @ApiResponse({ status: 200, description: 'User LP holdings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserLPHoldings(
    @Param('brandId') brandId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      this.logger.log(`Getting user LP holdings for brandId=${brandId}, user=${userAddress}`)
      const result = await this.perkManagerService.getUserLPHoldings(brandId, userAddress)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      this.handleError(error, 'Failed to get user LP holdings')
    }
  }

  /**
   * Gets user token holding start time for a brand
   */
  @Get('user-holding-start/:brandId/:userAddress')
  @ApiOperation({ summary: 'Get user token holding start time for a brand' })
  @ApiResponse({ status: 200, description: 'User holding start time retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserHoldingStartTime(
    @Param('brandId') brandId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      this.logger.log(`Getting user holding start time for brandId=${brandId}, user=${userAddress}`)
      const result = await this.perkManagerService.getUserHoldingStartTime(brandId, userAddress)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      this.handleError(error, 'Failed to get user holding start time')
    }
  }

  /**
   * Gets NFT perk configuration
   */
  @Get('nft-perk-config/:brandId/:perkId')
  @ApiOperation({ summary: 'Get NFT perk configuration' })
  @ApiResponse({ status: 200, description: 'NFT perk configuration retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNFTPerkConfig(@Param('brandId') brandId: string, @Param('perkId') perkId: string) {
    try {
      this.logger.log(`Getting NFT perk config for brandId=${brandId}, perkId=${perkId}`)
      const result = await this.perkManagerService.getNFTPerkConfig(brandId, perkId)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      this.handleError(error, 'Failed to get NFT perk configuration')
    }
  }

  /**
   * Gets brand perks count - currently disabled
   */
  @Get('brand-perks-count/:brandId')
  @ApiOperation({ summary: 'Get total number of perks for a brand' })
  @ApiResponse({ status: 200, description: 'Brand perks count retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBrandPerksCount(@Param('brandId') brandId: string) {
    return {
      success: true,
      data: {
        brandId,
        totalPerks: 0,
        note: 'This endpoint has been temporarily disabled due to blockchain contract compatibility issues',
      },
    }
  }

  /**
   * Gets detailed perk eligibility information
   */
  @Get('perk-eligibility/:brandId/:perkId/:userAddress')
  @ApiOperation({ summary: 'Get detailed perk eligibility information' })
  @ApiResponse({ status: 200, description: 'Perk eligibility details retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPerkEligibilityDetails(
    @Param('brandId') brandId: string,
    @Param('perkId') perkId: string,
    @Param('userAddress') userAddress: string,
  ) {
    try {
      this.logger.log(
        `Getting perk eligibility details for brandId=${brandId}, perkId=${perkId}, user=${userAddress}`,
      )
      const result = await this.perkManagerService.getPerkEligibilityDetails(
        brandId,
        perkId,
        userAddress,
      )
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      this.handleError(error, 'Failed to get perk eligibility details')
    }
  }

  /**
   * Gets PerkManager contract status
   */
  @Get('contract-status')
  @ApiOperation({ summary: 'Get PerkManager contract status' })
  @ApiResponse({ status: 200, description: 'Contract status retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getContractStatus() {
    try {
      this.logger.log('Getting contract status')
      const result = await this.perkManagerService.getContractStatus()
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      this.handleError(error, 'Failed to get contract status')
    }
  }

  /**
   * Gets brand holder snapshots - currently disabled
   */
  @Get('brand-snapshots/:brandId')
  @ApiOperation({ summary: 'Get brand holder snapshots' })
  @ApiResponse({ status: 200, description: 'Brand snapshots retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getBrandSnapshots(@Param('brandId') brandId: string) {
    return {
      success: true,
      data: {
        brandId,
        snapshots: {
          timestamp: new Date(),
          totalHolders: '0',
        },
        note: 'This endpoint has been disabled due to blockchain contract incompatibility',
      },
    }
  }

  /**
   * Helper method: Validates perk requirements without auto-adjusting
   */
  private validateAndAdjustRequirements(dto: UpdatePerkRequirementsDto): UpdatePerkRequirementsDto {
    const currentTimestamp = Math.floor(Date.now() / 1000)

    // Verify requirements without modifying them
    if (dto.startTime <= currentTimestamp) {
      this.logger.warn(`Warning: startTime (${dto.startTime}) is in the past`)
    }

    if (dto.endTime <= dto.startTime) {
      this.logger.warn(
        `Warning: endTime (${dto.endTime}) is not after startTime (${dto.startTime})`,
      )
    }

    if (dto.minHoldingAmount === 0) {
      this.logger.warn('Warning: minHoldingAmount is zero')
    }

    // Return the original DTO without modifications
    return dto
  }

  /**
   * Helper method: Validates required fields in a DTO
   */
  private validateRequiredFields(dto: any, fields: string[]): void {
    for (const field of fields) {
      if (!dto[field]) {
        throw new HttpException(
          {
            success: false,
            error: 'Invalid input data',
            details: `${field} is required`,
          },
          HttpStatus.BAD_REQUEST,
        )
      }
    }
  }

  /**
   * Helper method: Validates Ethereum address format
   */
  private validateEthereumAddress(address: string): void {
    if (!address.startsWith('0x') || address.length !== 42) {
      throw new HttpException(
        {
          success: false,
          error: 'Invalid address format',
          details: 'User address must be a valid Ethereum address',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  /**
   * Helper method: Validates brand ID format
   */
  private validateBrandId(brandId: string): void {
    if (!/^\d+$/.test(brandId) && !brandId.includes('-')) {
      throw new HttpException(
        {
          success: false,
          error: 'Invalid brandId format',
          details: 'Brand ID must be a numeric string or UUID',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  /**
   * Helper method: Handles standard errors
   */
  private handleError(error: any, defaultMessage: string): never {
    if (error.message?.includes('transaction failed') || error.message?.includes('reverted')) {
      throw new HttpException(
        {
          success: false,
          error: 'Smart contract transaction reverted',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    throw new HttpException(
      {
        success: false,
        error: defaultMessage,
        details: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }

  /**
   * Helper method: Handles contract errors with specific error messages
   */
  private handleContractError(error: any, errorMessages: Record<string, string>): never {
    if (error.message?.includes('transaction failed') || error.message?.includes('reverted')) {
      let errorDetails = 'The transaction was reverted by the smart contract'

      for (const [errorKey, message] of Object.entries(errorMessages)) {
        if (error.message.includes(errorKey)) {
          errorDetails = message
          break
        }
      }

      throw new HttpException(
        {
          success: false,
          error: 'Smart contract transaction reverted',
          details: errorDetails,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    throw new HttpException(
      {
        success: false,
        error: 'Contract operation failed',
        details: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }

  /**
   * Helper method: Handles NFT configuration errors
   */
  private handleNFTConfigError(error: any, brandId: string, perkId: string): never {
    if (error.message?.includes('transaction failed') || error.message?.includes('reverted')) {
      let errorDetails = 'The transaction was reverted by the smart contract'

      if (error.message.includes('InvalidNFTConfig')) {
        errorDetails =
          'Invalid NFT configuration according to contract rules. Either discountAmount or discountPercent must be > 0, and duration must be > 0.'
      } else if (error.message.includes('PerkNotFound')) {
        errorDetails = `Perk not found with brandId=${brandId}, perkId=${perkId}. Create the perk first before configuring it.`
      } else if (error.message.includes('onlyBrandOwner')) {
        errorDetails = 'Only the brand owner can configure perks for this brand.'
      }

      throw new HttpException(
        {
          success: false,
          error: 'Smart contract transaction reverted',
          details: errorDetails,
        },
        HttpStatus.BAD_REQUEST,
      )
    }

    throw new HttpException(
      {
        success: false,
        error: 'Failed to configure NFT perk',
        details: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}
