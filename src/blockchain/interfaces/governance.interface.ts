export interface TransactionResponse {
  hash: string
  success: boolean
  error?: string
  blockNumber?: number
  gasUsed?: string
  status?: number
  proposalId?: string
  additionalHours?: number
  delegatedTo?: string
  bannedAddress?: string
  reason?: string
  message?: string
  brandIds?: string[]
  description?: string
  tokenAmount?: string
  strategies?: string[]
  minTokens?: number
  minHoldingDuration?: number
  newSupport?: boolean
}

export interface ProposalResponse {
  id: string
  brandId: string
  creator: string
  tokenAmount: string
  description: string
  startTime: string
  endTime: string
  forVotes: string
  againstVotes: string
  quorum: string
  minApprovalPercentage: string
  status: number
}

export interface ProposalListResponse {
  proposals: ProposalResponse[]
  total: number
}

export interface VoteResponse {
  hasVoted: boolean
  support: boolean
  voteWeight: string
}

export interface VoteListResponse {
  votes: VoteResponse[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface GovernanceParamsResponse {
  votingDuration: number
  quorumPercentage: number
  approvalPercentage: number
  brandId?: string
}

export interface ProposalVoteInfo {
  hasVoted: boolean
  support: boolean
  voteWeight: string
}

// NEW INTERFACES FOR MISSING GOVERNANCE APIs

export interface ProposalStatisticsResponse {
  totalProposals: number
  activeProposals: number
  completedProposals: number
  successfulProposals: number
  failedProposals: number
  averageVotingParticipation: string
  totalVotesCast: number
  mostActiveVoter: string
  totalTokensVoted: string
}

export interface GovernanceMemberResponse {
  address: string
  totalVotes: number
  proposalsCreated: number
  votingPower: string
  participationRate: string
  lastActivity: string
  delegatedTo?: string
  delegatedFrom: string[]
  reputationScore: number
  isBanned: boolean
}

export interface GovernanceAnalyticsResponse {
  participationRate: string
  proposalSuccessRate: string
  voterTurnout: string
  governanceHealth: string
  totalMembers: number
  activeMembers: number
  averageVotingTime: number
  quorumAchievementRate: string
  timeToDecision: string
}

export interface VotingDelegationResponse {
  delegator: string
  delegatedTo: string
  delegationTime: string
  votingPower: string
  isActive: boolean
}

export interface GovernanceSecurityResponse {
  reportId: string
  reportedAddress: string
  reporterAddress: string
  reason: string
  evidence: string
  timestamp: string
  status: 'pending' | 'investigated' | 'resolved' | 'dismissed'
  actionTaken?: string
}

export interface CrossBrandProposalResponse {
  id: string
  brandIds: string[]
  description: string
  tokenAmount: string
  creator: string
  startTime: string
  endTime: string
  crossBrandVotes: Array<{
    brandId: string
    forVotes: string
    againstVotes: string
    quorum: string
  }>
  status: number
}

export interface GovernanceConfigResponse {
  strategyId: string
  strategyName: string
  description: string
  parameters: Record<string, any>
  isActive: boolean
  supportedFeatures: string[]
}

// TOKEN GOVERNANCE INTERFACES FOR FIGMA FEATURES

export interface RewardConditionResponse {
  id: string
  brandId: string
  conditionType: 'holding' | 'staking' | 'trading'
  requiredAmount: string
  duration: number
  rewardAmount: string
  description: string
  isActive: boolean
  startTime: string
  endTime: string
  totalClaimed: string
  recipientCount: number
  createdAt: string
}

export interface ConditionValidationResponse {
  isValid: boolean
  userAddress: string
  conditionId: string
  currentAmount: string
  requiredAmount: string
  holdingDuration: number
  requiredDuration: number
  eligibleReward: string
  claimable: boolean
  reason?: string
}

export interface AutomaticRewardResponse {
  totalProcessed: number
  totalRewards: string
  eligibleUsers: number
  distributedUsers: number
  failedDistributions: number
  processedConditions: Array<{
    conditionId: string
    recipients: number
    totalReward: string
  }>
}

export interface DistributionHistoryResponse {
  distributions: Array<{
    id: string
    type: 'manual' | 'automatic' | 'campaign'
    brandId: string
    totalTokens: string
    recipientCount: number
    timestamp: string
    status: 'completed' | 'pending' | 'failed'
    description: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DistributionRecipientsResponse {
  recipients: Array<{
    address: string
    amount: string
    status: 'completed' | 'pending' | 'failed'
    timestamp: string
    txHash?: string
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DistributionCampaignResponse {
  id: string
  brandId: string
  name: string
  description: string
  startTime: string
  endTime: string
  totalTokens: string
  distributedTokens: string
  remainingTokens: string
  recipientCount: number
  status: 'active' | 'completed' | 'cancelled' | 'paused'
  createdAt: string
}

export interface CampaignStatisticsResponse {
  campaignId: string
  totalAllocated: string
  totalDistributed: string
  remainingTokens: string
  recipientCount: number
  distributionCount: number
  averageDistribution: string
  participationRate: string
  completionRate: string
  timeRemaining: string
  dailyDistribution: string
}

export interface TokenAllocationSummaryResponse {
  brandId: string
  totalSupply: string
  totalAllocated: string
  availableForRewards: string
  distributedRewards: string
  pendingRewards: string
  reservedTokens: string
  allocationBreakdown: {
    treasury: string
    rewards: string
    staking: string
    liquidity: string
    team: string
    marketing: string
  }
  allocationHistory: Array<{
    timestamp: string
    amount: string
    source: string
    purpose: string
    txHash: string
  }>
}
