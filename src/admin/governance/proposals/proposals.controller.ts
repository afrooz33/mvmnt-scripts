import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { ProposalsService } from './proposals.service'
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
} from '@app/src/blockchain/interfaces/governance.interface'
import {
  TransactionResponseDto,
  ProposalResponseDto,
  ProposalListResponseDto,
  VoteResponseDto,
  VoteListResponseDto,
  CreateProposalDto,
  VoteDto,
} from '@app/src/blockchain/dto/responses.dto'

@ApiTags('Admin - Governance - Proposals')
@ApiBearerAuth()
@UseGuards(AdminJwtAuthGuard, AdminRolesGuard)
@Controller('admin/governance/proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Create a new proposal' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async createProposal(@Body() createProposalDto: CreateProposalDto): Promise<TransactionResponse> {
    return this.proposalsService.createProposal(createProposalDto)
  }

  @Post(':proposalId/:action')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Perform an action on a proposal',
    description:
      'Available actions: cancel, execute, finalize. Use the action as a path parameter.',
  })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiParam({
    name: 'action',
    description: 'Action to perform on the proposal',
    enum: ['cancel', 'execute', 'finalize'],
  })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid action specified' })
  async handleProposalAction(
    @Param('proposalId') proposalId: number,
    @Param('action') action: 'cancel' | 'execute' | 'finalize',
    @Body('userWalletAddress') userWalletAddress?: string,
  ): Promise<TransactionResponse> {
    const actionMap = {
      cancel: 'cancelProposal',
      execute: 'executeProposal',
      finalize: 'finalizeProposal',
    }

    const serviceMethod = actionMap[action]

    if (!serviceMethod) {
      throw new BadRequestException(ErrorKey.INVALID_OPTION)
    }

    return this.proposalsService[serviceMethod]({ proposalId, userWalletAddress })
  }

  @Get(':proposalId')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get proposal details' })
  @ApiResponse({ status: 200, type: ProposalResponseDto })
  async getProposalDetails(@Param('proposalId') proposalId: number): Promise<ProposalResponse> {
    return this.proposalsService.getProposalDetails(proposalId)
  }

  @Get('brands/:brandId')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Get all proposals for a brand',
    description: 'Returns paginated list of proposals for a specific brand',
  })
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

    return this.proposalsService.getBrandProposals(brandId, page, limit)
  }

  @Get('brands/:brandId/active')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get active proposal for a brand' })
  @ApiResponse({ status: 200, type: ProposalResponseDto })
  async getActiveProposal(@Param('brandId') brandId: string): Promise<ProposalResponse | null> {
    return this.proposalsService.getActiveProposal(brandId)
  }

  @Post(':proposalId/vote')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Cast a vote on a proposal' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  async castVote(
    @Param('proposalId') proposalId: number,
    @Body() voteDto: VoteDto,
  ): Promise<TransactionResponse> {
    return this.proposalsService.castVote({ proposalId, ...voteDto })
  }

  @Get(':proposalId/votes')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Get all votes for a proposal',
    description: 'Returns paginated list of all votes cast on a specific proposal',
  })
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
    @Param('proposalId') proposalId: number,
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

    return this.proposalsService.getProposalVotes({ proposalId, page, limit })
  }

  @Get(':proposalId/votes/:voter')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get vote details for a specific voter on a proposal' })
  @ApiParam({ name: 'proposalId', description: 'Proposal ID' })
  @ApiParam({ name: 'voter', description: 'Voter address' })
  @ApiResponse({ status: 200, type: VoteResponseDto })
  async getVoteDetails(
    @Param('proposalId') proposalId: number,
    @Param('voter') voter: string,
  ): Promise<VoteResponse> {
    return this.proposalsService.getVoteDetails({ proposalId, voter })
  }
}
