import { BaseContract, ContractTransactionResponse, Provider } from 'ethers'

export interface GovernanceContract extends BaseContract {
  readonly address: string
  readonly provider: Provider

  brandParams(brandId: number): Promise<{
    votingDuration: bigint
    quorumPercentage: bigint
    approvalPercentage: bigint
  }>

  proposals(proposalId: number): Promise<{
    brandId: bigint
    creator: string
    tokenAmount: bigint
    description: string
    startTime: bigint
    endTime: bigint
    forVotes: bigint
    againstVotes: bigint
    quorum: bigint
    minApprovalPercentage: bigint
    status: number
  }>

  votes(
    proposalId: number,
    voter: string,
  ): Promise<{
    hasVoted: boolean
    support: boolean
    voteWeight: bigint
  }>

  createProposal(
    brandId: number | string,
    tokenAmount: number | string,
    description: string,
  ): Promise<ContractTransactionResponse>

  cancelProposal(proposalId: number): Promise<ContractTransactionResponse>

  executeProposal(proposalId: number): Promise<ContractTransactionResponse>

  finalizeProposal(proposalId: number): Promise<ContractTransactionResponse>

  castVote(proposalId: number, support: boolean): Promise<ContractTransactionResponse>

  getActiveProposal(brandId: number): Promise<bigint>

  getBrandProposals(brandId: number): Promise<bigint[]>

  getProposalCount(): Promise<bigint>

  setGovernanceParams(
    brandId: number,
    votingDuration: number | string,
    quorumPercentage: number,
    approvalPercentage: number,
  ): Promise<ContractTransactionResponse>

  btManager(): Promise<string>

  updateBTManager(btManager: string): Promise<ContractTransactionResponse>

  pause(): Promise<ContractTransactionResponse>
  unpause(): Promise<ContractTransactionResponse>
  paused(): Promise<boolean>

  // NEW FUNCTIONS FOR MISSING GOVERNANCE APIS

  // Advanced Proposal Management
  extendVotingPeriod(
    proposalId: number,
    additionalSeconds: number,
  ): Promise<ContractTransactionResponse>
  delegateProposalVote(proposalId: number, delegateTo: string): Promise<ContractTransactionResponse>
  amendProposal(
    proposalId: number,
    newDescription: string,
    newTokenAmount: number,
  ): Promise<ContractTransactionResponse>

  // Voting System Enhancements
  delegateVotingPower(delegateTo: string): Promise<ContractTransactionResponse>
  removeDelegation(): Promise<ContractTransactionResponse>
  getDelegation(address: string): Promise<{
    delegatedTo: string
    timestamp: bigint
    votingPower: bigint
    isActive: boolean
  }>
  getVotingPower(address: string): Promise<bigint>
  changeVote(proposalId: number, newSupport: boolean): Promise<ContractTransactionResponse>

  // Member Management
  getGovernanceMembers(): Promise<string[]>
  getMemberInfo(address: string): Promise<{
    totalVotes: bigint
    proposalsCreated: bigint
    votingPower: bigint
    participationRate: bigint
    lastActivity: bigint
    delegatedTo: string
    delegatedFrom: string[]
    reputationScore: bigint
    isBanned: boolean
  }>
  banMember(address: string, reason: string): Promise<ContractTransactionResponse>

  // Analytics
  getGovernanceAnalytics(): Promise<{
    participationRate: bigint
    proposalSuccessRate: bigint
    voterTurnout: bigint
    governanceHealth: bigint
    totalMembers: bigint
    activeMembers: bigint
    averageVotingTime: bigint
    quorumAchievementRate: bigint
    timeToDecision: bigint
  }>

  // Multi-Brand Governance
  getCrossBrandProposals(): Promise<bigint[]>
  getCrossBrandProposal(proposalId: bigint): Promise<{
    brandIds: bigint[]
    description: string
    tokenAmount: bigint
    creator: string
    startTime: bigint
    endTime: bigint
    crossBrandVotes: Array<{
      brandId: bigint
      forVotes: bigint
      againstVotes: bigint
      quorum: bigint
    }>
    status: number
  }>
  createCrossBrandProposal(
    brandIds: string[],
    description: string,
    tokenAmount: number,
  ): Promise<ContractTransactionResponse>
  getAllBrandIds(): Promise<bigint[]>

  // Security Features
  freezeVoting(): Promise<ContractTransactionResponse>
  getSecurityEvents(): Promise<
    Array<{
      reportId: string
      reportedAddress: string
      reporterAddress: string
      reason: string
      evidence: string
      timestamp: bigint
      status: string
      actionTaken: string
    }>
  >
  emergencyOverride(proposalId: number, reason: string): Promise<ContractTransactionResponse>

  // Configuration
  updateVotingStrategies(strategies: string[]): Promise<ContractTransactionResponse>
  getAvailableStrategies(): Promise<
    Array<{
      id: string
      name: string
      description: string
      parameters: any
      isActive: boolean
      supportedFeatures: string[]
    }>
  >
  updateProposalRequirements(
    minTokens: number,
    minHoldingDuration: number,
  ): Promise<ContractTransactionResponse>

  // ===========================================
  // TOKEN GOVERNANCE FUNCTIONS - FIGMA FEATURES
  // ===========================================

  // Token Distribution Functions
  getTokenAllocation(brandId: number): Promise<{
    availableForRewards: bigint
    totalAllocated: bigint
  }>
  distributeTokensManually(
    brandId: number,
    recipients: string[],
    amounts: bigint[],
  ): Promise<ContractTransactionResponse>

  // Conditional Reward Functions
  createRewardCondition(
    brandId: number,
    conditionType: string,
    requiredAmount: bigint,
    duration: number,
    rewardAmount: bigint,
    description: string,
  ): Promise<ContractTransactionResponse>
  editRewardCondition(
    conditionId: number,
    requiredAmount: bigint,
    duration: number,
    rewardAmount: bigint,
    description: string,
  ): Promise<ContractTransactionResponse>
  setConditionSchedule(
    conditionId: number,
    startTime: number,
    endTime: number,
    isActive: boolean,
  ): Promise<ContractTransactionResponse>
  getRewardConditions(brandId: number): Promise<
    Array<{
      conditionType: string
      requiredAmount: bigint
      duration: bigint
      rewardAmount: bigint
      description: string
      isActive: boolean
      startTime: bigint
      endTime: bigint
      totalClaimed: bigint
      recipientCount: bigint
      createdAt: bigint
    }>
  >
  validateCondition(
    conditionId: number,
    userAddress: string,
  ): Promise<{
    isValid: boolean
    currentAmount: bigint
    requiredAmount: bigint
    holdingDuration: bigint
    requiredDuration: bigint
    eligibleReward: bigint
    claimable: boolean
    reason: string
  }>
  processAutomaticRewards(brandId: number): Promise<ContractTransactionResponse>
  getLastProcessingResults(): Promise<{
    totalProcessed: bigint
    totalRewards: bigint
    eligibleUsers: bigint
    distributedUsers: bigint
    failedDistributions: bigint
    processedConditions: Array<{
      conditionId: bigint
      recipients: bigint
      totalReward: bigint
    }>
  }>

  // Distribution History Functions
  getDistributionHistory(
    brandId: number,
    page: number,
    limit: number,
  ): Promise<{
    distributions: Array<{
      id: bigint
      distributionType: string
      totalTokens: bigint
      recipientCount: bigint
      timestamp: bigint
      status: string
      description: string
    }>
    total: bigint
  }>
  getDistributionRecipients(
    distributionId: number,
    page: number,
    limit: number,
  ): Promise<{
    recipients: Array<{
      address: string
      amount: bigint
      status: string
      timestamp: bigint
      txHash: string
    }>
    total: bigint
  }>

  // Distribution Campaign Functions
  createDistributionCampaign(
    brandId: number,
    name: string,
    description: string,
    startTime: number,
    endTime: number,
    totalTokens: bigint,
  ): Promise<ContractTransactionResponse>
  getDistributionCampaigns(brandId: number): Promise<
    Array<{
      id: bigint
      name: string
      description: string
      startTime: bigint
      endTime: bigint
      totalTokens: bigint
      distributedTokens: bigint
      recipientCount: bigint
      status: string
      createdAt: bigint
    }>
  >
  closeCampaign(campaignId: number, reason: string): Promise<ContractTransactionResponse>
  updateCampaign(
    campaignId: number,
    name: string,
    description: string,
    startTime: number,
    endTime: number,
    totalTokens: bigint,
  ): Promise<ContractTransactionResponse>
  deleteCampaign(
    campaignId: number,
    reason: string,
    forceDelete: boolean,
  ): Promise<ContractTransactionResponse>
  getCampaignStatistics(campaignId: number): Promise<{
    totalAllocated: bigint
    totalDistributed: bigint
    recipientCount: bigint
    distributionCount: bigint
    averageDistribution: bigint
    participationRate: bigint
    completionRate: bigint
    timeRemaining: bigint
    dailyDistribution: bigint
  }>

  // Token Allocation Functions
  allocateTokensForRewards(
    brandId: number,
    amount: bigint,
    source: string,
  ): Promise<ContractTransactionResponse>
  getTokenAllocationSummary(brandId: number): Promise<{
    totalSupply: bigint
    totalAllocated: bigint
    availableForRewards: bigint
    distributedRewards: bigint
    pendingRewards: bigint
    reservedTokens: bigint
    breakdown: {
      treasury: bigint
      rewards: bigint
      staking: bigint
      liquidity: bigint
      team: bigint
      marketing: bigint
    }
    history: Array<{
      timestamp: bigint
      amount: bigint
      source: string
      purpose: string
      txHash: string
    }>
  }>
}
