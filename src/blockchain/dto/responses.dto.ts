import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsNumberString,
  IsNumber,
  Min,
  Max,
  IsString,
  IsOptional,
  Matches,
  IsBoolean,
  IsArray,
} from 'class-validator'

// Base response interface
export interface BaseResponse {
  success: boolean
  message: string
  timestamp: string
}

// Error response interface
export interface ErrorResponse extends BaseResponse {
  error: {
    code: string
    details?: any
  }
}

// Success response interface
export interface SuccessResponse<T> extends BaseResponse {
  data: T
}

// Staking specific DTOs
export class StakingConfigResponseDto {
  @ApiProperty({ description: 'Base reward rate in wei' })
  baseRewardRate: string

  @ApiProperty({ description: 'Bonus reward rate in wei' })
  bonusRewardRate: string

  @ApiProperty({ description: 'Maximum lock period in seconds' })
  maxLockPeriod: number

  @ApiProperty({ description: 'Minimum stake amount in wei' })
  minStakeAmount: string

  @ApiProperty({ description: 'Whether staking is paused' })
  paused: boolean
}

export class StakeInfoResponseDto {
  @ApiProperty({ description: 'Stake ID' })
  stakeId: number

  @ApiProperty({ description: 'Amount staked in wei' })
  amount: string

  @ApiProperty({ description: 'Start time of stake' })
  startTime: number

  @ApiProperty({ description: 'Lock period in seconds' })
  lockPeriod: number

  @ApiProperty({ description: 'Last claim time' })
  lastClaimTime: number

  @ApiProperty({ description: 'Whether stake is LP token' })
  isLPToken: boolean

  @ApiProperty({ description: 'Whether stake is active' })
  active: boolean
}

export class UserStakesResponseDto {
  @ApiProperty({ type: [StakeInfoResponseDto] })
  stakes: StakeInfoResponseDto[]

  @ApiProperty({ description: 'Total amount staked in wei' })
  totalStaked: string
}

export class StakingEligibilityResponseDto {
  @ApiProperty({ description: 'Whether user can stake' })
  canStake: boolean

  @ApiProperty({ description: 'Reason if cannot stake', required: false })
  reason?: string

  @ApiProperty({ description: 'User token balance in wei', required: false })
  balance?: string

  @ApiProperty({ description: 'Token allowance in wei', required: false })
  allowance?: string

  @ApiProperty({ description: 'Minimum stake amount in wei', required: false })
  minStakeAmount?: string
}

export class TransactionResponseDto {
  @ApiProperty({ description: 'Transaction hash' })
  hash: string

  @ApiProperty({ description: 'Block number' })
  blockNumber: number

  @ApiProperty({ description: 'Brand ID' })
  brandId: string

  @ApiProperty({ description: 'Amount in wei' })
  amount: string

  @ApiProperty({ description: 'User wallet address' })
  userAddress: string

  @ApiProperty({ description: 'Lock period in seconds' })
  lockPeriodSeconds: number

  @ApiProperty({ description: 'Success status' })
  success: boolean

  @ApiProperty({ description: 'Transaction message' })
  message: string

  @ApiProperty({ description: 'Transaction hash (alias for hash)' })
  transactionHash: string
}

export class APYResponseDto {
  @ApiProperty({ description: 'Brand token APY' })
  btAPY: string

  @ApiProperty({ description: 'LP token APY' })
  lpAPY: string

  @ApiProperty({ description: 'Trading volume in wei' })
  tradingVolume: string

  @ApiProperty({ description: 'Total value locked in wei' })
  tvl: string
}

// Error response DTOs
export class StakingErrorResponseDto implements ErrorResponse {
  @ApiProperty({ description: 'Success status' })
  success: boolean = false

  @ApiProperty({ description: 'Error message' })
  message: string

  @ApiProperty({ description: 'Timestamp of error' })
  timestamp: string = new Date().toISOString()

  @ApiProperty({
    description: 'Error details',
    example: {
      code: 'STAKING_PAUSED',
      details: {
        brandId: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  error: {
    code: string
    details?: any
  }
}

// Success response DTOs
export class StakingSuccessResponseDto<T> implements SuccessResponse<T> {
  @ApiProperty({ description: 'Success status' })
  success: boolean = true

  @ApiProperty({ description: 'Success message' })
  message: string

  @ApiProperty({ description: 'Timestamp of response' })
  timestamp: string = new Date().toISOString()

  @ApiProperty({ description: 'Response data' })
  data: T
}

// ===========================================
// CORE GOVERNANCE DTOs
// ===========================================

export class ProposalResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  brandId: string

  @ApiProperty()
  creator: string

  @ApiProperty()
  tokenAmount: string

  @ApiProperty()
  description: string

  @ApiProperty()
  startTime: string

  @ApiProperty()
  endTime: string

  @ApiProperty()
  forVotes: string

  @ApiProperty()
  againstVotes: string

  @ApiProperty()
  quorum: string

  @ApiProperty()
  minApprovalPercentage: string

  @ApiProperty()
  status: number
}

export class ProposalListResponseDto {
  @ApiProperty({ type: [ProposalResponseDto] })
  proposals: ProposalResponseDto[]

  @ApiProperty({ description: 'Total number of proposals' })
  total: number

  @ApiProperty({ description: 'Current page number' })
  page: number

  @ApiProperty({ description: 'Number of items per page' })
  limit: number

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrevPage: boolean
}

export class VoteResponseDto {
  @ApiProperty()
  hasVoted: boolean

  @ApiProperty()
  support: boolean

  @ApiProperty()
  voteWeight: string
}

export class VoteListResponseDto {
  @ApiProperty({ type: [VoteResponseDto] })
  votes: VoteResponseDto[]

  @ApiProperty({ description: 'Total number of votes' })
  total: number

  @ApiProperty({ description: 'Current page number' })
  page: number

  @ApiProperty({ description: 'Number of items per page' })
  limit: number

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPrevPage: boolean
}

export class GovernanceParamsResponseDto {
  @ApiProperty()
  votingDuration: number

  @ApiProperty()
  quorumPercentage: number

  @ApiProperty()
  approvalPercentage: number
}

export class CreateProposalDto {
  @ApiProperty({ description: 'Brand ID', example: '1' })
  @IsNotEmpty()
  @IsNumberString()
  brandId: string

  @ApiProperty({ description: 'Token amount', example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  tokenAmount: number

  @ApiProperty({ description: 'Proposal description', example: 'Add new feature' })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class VoteDto {
  @ApiProperty({ description: 'Support the proposal', example: true })
  @IsNotEmpty()
  @IsBoolean()
  support: boolean

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class GovernanceParamsDto {
  @ApiProperty({ description: 'Voting duration in seconds', example: 604800 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  votingDuration: number

  @ApiProperty({ description: 'Required participation percentage (1-100)', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  quorumPercentage: number

  @ApiProperty({ description: 'Required approval percentage (1-100)', example: 51 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  approvalPercentage: number

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class UpdateBTManagerDto {
  @ApiProperty({
    description: 'BT Manager contract address',
    example: '0x742d35Cc6635C0532925a3b8D44c4f30e5e1E6bb',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'BT Manager must be a valid Ethereum address' })
  btManager: string

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'User wallet address must be a valid Ethereum address',
  })
  userWalletAddress?: string
}

// ===========================================
// FIGMA TOKEN GOVERNANCE DTOs
// ===========================================

// PHASE 1: MANUAL DISTRIBUTION
export class ManualDistributionDto {
  @ApiProperty({ description: 'Brand ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({
    description: 'Array of recipient addresses',
    example: ['0x742d35Cc6635C0532925a3b8D44c4f30e5e1E6bb'],
  })
  @IsNotEmpty()
  @IsArray()
  recipients: string[]

  @ApiProperty({ description: 'Array of token amounts for each recipient', example: [1000, 2000] })
  @IsNotEmpty()
  @IsArray()
  amounts: number[]

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class CSVUploadDto {
  @ApiProperty({ description: 'Brand ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({
    description: 'CSV data as string',
    example: 'address,amount\n0x123...,1000\n0x456...,2000',
  })
  @IsNotEmpty()
  @IsString()
  csvData: string

  @ApiProperty({ description: 'Only validate, do not execute', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  validateOnly?: boolean
}

export class CSVDistributionDto {
  @ApiProperty({ description: 'Brand ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({
    description: 'Validated distribution data',
    example: [{ address: '0x123...', amount: 1000 }],
  })
  @IsNotEmpty()
  @IsArray()
  distributionData: Array<{ address: string; amount: number }>

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

// PHASE 2: CONDITIONAL DISTRIBUTION
export class CreateConditionDto {
  @ApiProperty({ description: 'Brand ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({ description: 'Condition type', example: 'holding' })
  @IsNotEmpty()
  @IsString()
  conditionType: string

  @ApiProperty({ description: 'Required token amount', example: 50000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  requiredAmount: number

  @ApiProperty({ description: 'Duration in days', example: 30 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number

  @ApiProperty({ description: 'Reward amount', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  rewardAmount: number

  @ApiProperty({
    description: 'Condition description',
    example: 'Hold 50k tokens for 30 days to get 100 tokens reward',
  })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class EditConditionDto {
  @ApiProperty({ description: 'Required token amount', example: 60000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  requiredAmount?: number

  @ApiProperty({ description: 'Duration in days', example: 45, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number

  @ApiProperty({ description: 'Reward amount', example: 150, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  rewardAmount?: number

  @ApiProperty({ description: 'Condition description', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class ConditionScheduleDto {
  @ApiProperty({ description: 'Start time (Unix timestamp)', example: 1640995200 })
  @IsNotEmpty()
  @IsNumber()
  startTime: number

  @ApiProperty({ description: 'End time (Unix timestamp)', example: 1672531200 })
  @IsNotEmpty()
  @IsNumber()
  endTime: number

  @ApiProperty({ description: 'Is condition active', example: true })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class ValidateConditionDto {
  @ApiProperty({
    description: 'User address to validate',
    example: '0x742d35Cc6635C0532925a3b8D44c4f30e5e1E6bb',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userAddress: string
}

export class ProcessAutomaticDto {
  @ApiProperty({ description: 'Brand ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

// PHASE 3: DISTRIBUTION HISTORY
export class CreateCampaignDto {
  @ApiProperty({ description: 'Brand ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  brandId: string

  @ApiProperty({ description: 'Campaign name', example: 'Q1 2024 Rewards Campaign' })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    description: 'Campaign description',
    example: 'Quarterly reward distribution for active community members',
  })
  @IsNotEmpty()
  @IsString()
  description: string

  @ApiProperty({ description: 'Start time (Unix timestamp)', example: 1640995200 })
  @IsNotEmpty()
  @IsNumber()
  startTime: number

  @ApiProperty({ description: 'End time (Unix timestamp)', example: 1672531200 })
  @IsNotEmpty()
  @IsNumber()
  endTime: number

  @ApiProperty({ description: 'Total tokens allocated', example: 100000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalTokens: number

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class CloseCampaignDto {
  @ApiProperty({
    description: 'Reason for closing campaign',
    example: 'Campaign completed successfully',
  })
  @IsNotEmpty()
  @IsString()
  reason: string

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class UpdateCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Q1 2024 Rewards Campaign',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: 'Campaign description',
    example: 'Quarterly reward distribution for active community members',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: 'Start time (Unix timestamp)', example: 1640995200, required: false })
  @IsOptional()
  @IsNumber()
  startTime?: number

  @ApiProperty({ description: 'End time (Unix timestamp)', example: 1672531200, required: false })
  @IsOptional()
  @IsNumber()
  endTime?: number

  @ApiProperty({ description: 'Total tokens allocated', example: 100000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalTokens?: number

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class DeleteCampaignDto {
  @ApiProperty({
    description: 'Reason for deleting campaign',
    example: 'Campaign was created by mistake',
  })
  @IsNotEmpty()
  @IsString()
  reason: string

  @ApiProperty({
    description: 'Force delete even if campaign has distributions',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  forceDelete?: boolean

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}

export class TokenAllocationDto {
  @ApiProperty({
    description: 'Brand ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandId?: string

  @ApiProperty({ description: 'Amount to allocate', example: 500000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number

  @ApiProperty({ description: 'Source of allocation', example: 'treasury' })
  @IsNotEmpty()
  @IsString()
  source: string

  @ApiProperty({ description: 'Purpose of allocation', example: 'REWARDS', required: false })
  @IsOptional()
  @IsString()
  purpose?: string

  @ApiProperty({
    description: 'Description of allocation',
    example: 'Allocating tokens for reward distribution',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: 'User wallet address', required: false })
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  userWalletAddress?: string
}
