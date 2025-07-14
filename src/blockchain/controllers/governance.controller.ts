import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  UseGuards,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common'
import { GovernanceService } from '../services/governance.service'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { AdminJwtAuthGuard } from '@app/src/shared/auth/guards/admin-jwt-auth.guard'
import { AdminRolesGuard } from '@app/src/shared/auth/guards/admin-roles.guard'
import { Roles } from '@app/src/shared/auth/decorators/roles.decorator'
import { Role } from '@app/src/shared/enums/role.enum'
import { ErrorKey } from '@app/src/shared/enums'
import {
  TransactionResponse,
  ProposalResponse,
  ProposalListResponse,
  VoteResponse,
  VoteListResponse,
  GovernanceParamsResponse,
  RewardConditionResponse,
  ConditionValidationResponse,
  AutomaticRewardResponse,
  DistributionHistoryResponse,
  DistributionRecipientsResponse,
  DistributionCampaignResponse,
  CampaignStatisticsResponse,
  TokenAllocationSummaryResponse,
} from '../interfaces/governance.interface'
import {
  TransactionResponseDto,
  ProposalResponseDto,
  ProposalListResponseDto,
  VoteResponseDto,
  VoteListResponseDto,
  GovernanceParamsResponseDto,
  CreateProposalDto,
  VoteDto,
  GovernanceParamsDto,
  UpdateBTManagerDto,
  ManualDistributionDto,
  CSVUploadDto,
  CSVDistributionDto,
  CreateConditionDto,
  EditConditionDto,
  ConditionScheduleDto,
  ValidateConditionDto,
  ProcessAutomaticDto,
  CreateCampaignDto,
  CloseCampaignDto,
  UpdateCampaignDto,
  DeleteCampaignDto,
  TokenAllocationDto,
} from '../dto/responses.dto'

@ApiTags('Blockchain - Governance')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
@Controller('blockchain/governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post('proposals')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Create a new governance proposal' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async createProposal(@Body() createProposalDto: CreateProposalDto): Promise<TransactionResponse> {
    return this.governanceService.createProposal(createProposalDto)
  }

  @Put('proposals/:proposalId/:action')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Handle proposal actions (cancel, execute, finalize)' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiParam({
    name: 'action',
    enum: ['cancel', 'execute', 'finalize'],
    description: 'Action to perform',
  })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid action specified' })
  async handleProposalAction(
    @Param('proposalId') proposalId: string,
    @Param('action') action: 'cancel' | 'execute' | 'finalize',
    @Body('userWalletAddress') userWalletAddress?: string,
  ): Promise<TransactionResponse> {
    const serviceMethod = {
      cancel: () =>
        this.governanceService.cancelProposal({
          proposalId: Number(proposalId),
          userWalletAddress,
        }),
      execute: () =>
        this.governanceService.executeProposal({
          proposalId: Number(proposalId),
          userWalletAddress,
        }),
      finalize: () =>
        this.governanceService.finalizeProposal({
          proposalId: Number(proposalId),
          userWalletAddress,
        }),
    }[action]

    if (!serviceMethod) {
      throw new BadRequestException(ErrorKey.INVALID_OPTION)
    }

    return serviceMethod()
  }

  @Get('proposals/:proposalId')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get proposal details' })
  @ApiResponse({ status: 200, type: ProposalResponseDto })
  async getProposalDetails(@Param('proposalId') proposalId: string): Promise<ProposalResponse> {
    return this.governanceService.getProposalDetails(Number(proposalId))
  }

  @Get('brands/:brandId/proposals')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get all proposals for a brand with pagination' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiQuery({
    name: 'page',
    description: 'Page number (default: 1)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page (default: 10, max: 100)',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, type: ProposalListResponseDto })
  async getBrandProposals(
    @Param('brandId') brandId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ProposalListResponse> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException(ErrorKey.INVALID_OPTION)
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException(ErrorKey.INVALID_OPTION)
    }

    return this.governanceService.getBrandProposals(brandId, page, limit)
  }

  @Get('brands/:brandId/proposals/active')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get active proposal for a brand' })
  @ApiResponse({ status: 200, type: ProposalResponseDto })
  async getActiveProposal(@Param('brandId') brandId: string): Promise<ProposalResponse | null> {
    return this.governanceService.getActiveProposal(brandId)
  }

  @Post('proposals/:proposalId/vote')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Cast a vote on a proposal' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async castVote(
    @Param('proposalId') proposalId: string,
    @Body() voteDto: VoteDto,
  ): Promise<TransactionResponse> {
    return this.governanceService.castVote({ proposalId: Number(proposalId), ...voteDto })
  }

  @Get('proposals/:proposalId/votes')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get all votes for a proposal with pagination' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiQuery({
    name: 'page',
    description: 'Page number (default: 1)',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page (default: 10, max: 100)',
    required: false,
    type: Number,
  })
  @ApiResponse({ status: 200, type: VoteListResponseDto })
  async getProposalVotes(
    @Param('proposalId') proposalId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<VoteListResponse> {
    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException(ErrorKey.INVALID_OPTION)
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException(ErrorKey.INVALID_OPTION)
    }

    return this.governanceService.getProposalVotes({ proposalId: Number(proposalId), page, limit })
  }

  @Get('proposals/:proposalId/votes/:voter')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get vote details for a specific voter on a proposal' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiParam({ name: 'voter', description: 'Voter address' })
  @ApiResponse({ status: 200, type: VoteResponseDto })
  async getVoteDetails(
    @Param('proposalId') proposalId: string,
    @Param('voter') voter: string,
  ): Promise<VoteResponse> {
    return this.governanceService.getVoteDetails({ proposalId: Number(proposalId), voter })
  }

  @Put('brands/:brandId/params')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Set governance parameters for a brand' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async setGovernanceParams(
    @Param('brandId') brandId: string,
    @Body() params: GovernanceParamsDto,
  ): Promise<TransactionResponse> {
    return this.governanceService.setGovernanceParams({ brandId, ...params })
  }

  @Get('brands/:brandId/params')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get governance parameters for a brand' })
  @ApiResponse({ status: 200, type: GovernanceParamsResponseDto })
  async getGovernanceParams(@Param('brandId') brandId: string): Promise<GovernanceParamsResponse> {
    return this.governanceService.getGovernanceParams(brandId)
  }

  @Post('pause')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Pause the governance contract' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async pause(@Body('userWalletAddress') userWalletAddress?: string): Promise<TransactionResponse> {
    return this.governanceService.pause(userWalletAddress)
  }

  @Post('unpause')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Unpause the governance contract' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async unpause(
    @Body('userWalletAddress') userWalletAddress?: string,
  ): Promise<TransactionResponse> {
    return this.governanceService.unpause(userWalletAddress)
  }

  @Get('paused')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Check if the governance contract is paused' })
  @ApiResponse({ status: 200, type: Boolean })
  async isPaused(): Promise<{ isPaused: boolean }> {
    const paused = await this.governanceService.isPaused()
    return { isPaused: paused }
  }

  @Post('update-bt-manager')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update the BT Manager address' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async updateBTManager(
    @Body() updateBTManagerDto: UpdateBTManagerDto,
  ): Promise<TransactionResponse> {
    return this.governanceService.updateBTManager(updateBTManagerDto)
  }

  // Commented out by request: getAvailableTokensForRewards
  // @Get('tokens/available-for-rewards/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get available tokens for rewards distribution' })
  // @ApiResponse({ status: 200, type: Object })
  // async getAvailableTokensForRewards(
  //   @Param('brandId') brandId: string,
  // ): Promise<{ availableTokens: string; totalAllocated: string }> {
  //   return this.governanceService.getAvailableTokensForRewards({ brandId })
  // }

  // Commented out by request: distributeTokensManually
  // @Post('tokens/distribute-manual')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Distribute tokens manually to selected recipients' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async distributeTokensManually(
  //   @Body() manualDistributionDto: ManualDistributionDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.distributeTokensManually(manualDistributionDto)
  // }

  // Commented out by request: uploadDistributionCSV
  // @Post('tokens/upload-csv')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Upload CSV file for bulk token distribution' })
  // @ApiResponse({ status: 200, type: Object })
  // async uploadDistributionCSV(@Body() csvUploadDto: CSVUploadDto): Promise<any> {
  //   return this.governanceService.processCSVDistribution(csvUploadDto)
  // }

  // Commented out by request: executeCSVDistribution
  // @Post('tokens/distribute-csv')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Execute bulk distribution from validated CSV data' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async executeCSVDistribution(
  //   @Body() csvDistributionDto: CSVDistributionDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.executeCSVDistribution(csvDistributionDto)
  // }

  // Commented out by request: createRewardCondition
  // @Post('rewards/conditions')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Create new conditional reward rule' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async createRewardCondition(
  //   @Body() conditionDto: CreateConditionDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.createRewardCondition(conditionDto)
  // }

  // Commented out by request: editRewardCondition
  // @Put('rewards/conditions/:conditionId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Edit existing reward condition' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async editRewardCondition(
  //   @Param('conditionId') conditionId: string,
  //   @Body() editConditionDto: EditConditionDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.editRewardCondition({
  //     conditionId: Number(conditionId),
  //     ...editConditionDto,
  //   })
  // }

  // Commented out by request: setConditionSchedule
  // @Post('rewards/conditions/:conditionId/schedule')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Set schedule for reward condition' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async setConditionSchedule(
  //   @Param('conditionId') conditionId: string,
  //   @Body() scheduleDto: ConditionScheduleDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.setConditionSchedule({
  //     conditionId: Number(conditionId),
  //     ...scheduleDto,
  //   })
  // }

  // Commented out by request: getRewardConditions
  // @Get('rewards/conditions/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get all reward conditions for a brand' })
  // @ApiResponse({ status: 200, type: Object })
  // async getRewardConditions(@Param('brandId') brandId: string): Promise<RewardConditionResponse[]> {
  //   return this.governanceService.getRewardConditions({ brandId })
  // }

  // Commented out by request: validateCondition
  // @Post('rewards/conditions/:conditionId/validate')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Validate condition for specific address' })
  // @ApiResponse({ status: 200, type: Object })
  // async validateCondition(
  //   @Param('conditionId') conditionId: string,
  //   @Body() validateDto: ValidateConditionDto,
  // ): Promise<ConditionValidationResponse> {
  //   return this.governanceService.validateCondition({
  //     conditionId: Number(conditionId),
  //     ...validateDto,
  //   })
  // }

  // Commented out by request: processAutomaticRewards
  // @Post('rewards/process-automatic')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Process automatic reward distribution for all active conditions' })
  // @ApiResponse({ status: 200, type: Object })
  // async processAutomaticRewards(
  //   @Body() processDto: ProcessAutomaticDto,
  // ): Promise<AutomaticRewardResponse> {
  //   return this.governanceService.processAutomaticRewards(processDto)
  // }

  // Commented out by request: getDistributionHistory
  // @Get('distribution/history/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get distribution history for a brand' })
  // @ApiResponse({ status: 200, type: Object })
  // async getDistributionHistory(
  //   @Param('brandId') brandId: string,
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ): Promise<DistributionHistoryResponse> {
  //   return this.governanceService.getDistributionHistory({ brandId, page, limit })
  // }

  // Commented out by request: getDistributionRecipients
  // @Get('distribution/:distributionId/recipients')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get recipients list for specific distribution' })
  // @ApiResponse({ status: 200, type: Object })
  // async getDistributionRecipients(
  //   @Param('distributionId') distributionId: string,
  //   @Query('page') page: number = 1,
  //   @Query('limit') limit: number = 10,
  // ): Promise<DistributionRecipientsResponse> {
  //   return this.governanceService.getDistributionRecipients({
  //     distributionId: Number(distributionId),
  //     page,
  //     limit,
  //   })
  // }

  // Commented out by request: createDistributionCampaign
  // @Post('distribution/campaigns')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Create named distribution campaign' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async createDistributionCampaign(
  //   @Body() campaignDto: CreateCampaignDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.createDistributionCampaign(campaignDto)
  // }

  // Commented out by request: getDistributionCampaigns
  // @Get('distribution/campaigns/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get all campaigns for a brand' })
  // @ApiResponse({ status: 200, type: Object })
  // async getDistributionCampaigns(
  //   @Param('brandId') brandId: string,
  // ): Promise<DistributionCampaignResponse[]> {
  //   return this.governanceService.getDistributionCampaigns({ brandId })
  // }

  // Commented out by request: getCampaignById
  // @Get('distribution/campaigns/:campaignId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get campaign by ID' })
  // @ApiResponse({ status: 200, type: Object })
  // async getCampaignById(
  //   @Param('campaignId') campaignId: string,
  // ): Promise<DistributionCampaignResponse> {
  //   return this.governanceService.getCampaignById({ campaignId: Number(campaignId) })
  // }

  // Commented out by request: closeCampaign
  // @Put('distribution/campaigns/:campaignId/close')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Close a distribution campaign' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async closeCampaign(
  //   @Param('campaignId') campaignId: string,
  //   @Body() closeDto: CloseCampaignDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.closeCampaign({ campaignId: Number(campaignId), ...closeDto })
  // }

  // Commented out by request: updateCampaign
  // @Put('distribution/campaigns/:campaignId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Update campaign details' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async updateCampaign(
  //   @Param('campaignId') campaignId: string,
  //   @Body() updateDto: UpdateCampaignDto,
  // ): Promise<TransactionResponse> {
  //   // Get current campaign data to fill missing fields
  //   const currentCampaign = await this.governanceService.getCampaignById({
  //     campaignId: Number(campaignId),
  //   })

  //   if (!currentCampaign) {
  //     throw new BadRequestException(ErrorKey.RESOURCE_NOT_FOUND)
  //   }

  //   return this.governanceService.updateCampaign({
  //     campaignId: Number(campaignId),
  //     name: updateDto.name || currentCampaign.name,
  //     description: updateDto.description || currentCampaign.description,
  //     startTime: updateDto.startTime || currentCampaign.startTime,
  //     endTime: updateDto.endTime || currentCampaign.endTime,
  //     totalTokens: updateDto.totalTokens || currentCampaign.totalTokens,
  //     userWalletAddress: updateDto.userWalletAddress,
  //   })
  // }

  // Commented out by request: deleteCampaign
  // @Delete('distribution/campaigns/:campaignId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Delete a distribution campaign' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async deleteCampaign(
  //   @Param('campaignId') campaignId: string,
  //   @Body() deleteDto: DeleteCampaignDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.deleteCampaign({ campaignId: Number(campaignId), ...deleteDto })
  // }

  // Commented out by request: getCampaignStatistics
  // @Get('distribution/campaigns/:campaignId/statistics')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get campaign statistics' })
  // @ApiResponse({ status: 200, type: Object })
  // async getCampaignStatistics(
  //   @Param('campaignId') campaignId: string,
  // ): Promise<CampaignStatisticsResponse> {
  //   return this.governanceService.getCampaignStatistics({ campaignId: Number(campaignId) })
  // }

  // Commented out by request: allocateTokens
  // @Post('tokens/allocate')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Allocate tokens for general purpose' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async allocateTokens(@Body() allocationDto: TokenAllocationDto): Promise<TransactionResponse> {
  //   return this.governanceService.allocateTokensForRewards(allocationDto)
  // }

  // Commented out by request: allocateTokensForRewards
  // @Post('tokens/allocate/:brandId/rewards')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Allocate tokens specifically for rewards' })
  // @ApiResponse({ status: 200, type: TransactionResponseDto })
  // async allocateTokensForRewards(
  //   @Param('brandId') brandId: string,
  //   @Body() allocationDto: TokenAllocationDto,
  // ): Promise<TransactionResponse> {
  //   return this.governanceService.allocateTokensForRewards({ brandId, ...allocationDto })
  // }

  // Commented out by request: getTokenAllocationSummary
  // @Get('tokens/allocation/:brandId')
  // @Roles(Role.OWNER)
  // @ApiOperation({ summary: 'Get token allocation summary for a brand' })
  // @ApiResponse({ status: 200, type: Object })
  // async getTokenAllocationSummary(
  //   @Param('brandId') brandId: string,
  // ): Promise<TokenAllocationSummaryResponse> {
  //   return this.governanceService.getTokenAllocationSummary({ brandId })
  // }
}
