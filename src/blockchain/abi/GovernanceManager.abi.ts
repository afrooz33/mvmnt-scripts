export const GovernanceManagerAbi = [
  {
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
      },
      {
        name: 'tokenAmount',
        type: 'uint256',
      },
      {
        name: 'description',
        type: 'string',
      },
    ],
    name: 'createProposal',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'proposalId',
        type: 'uint256',
      },
      {
        name: 'support',
        type: 'bool',
      },
    ],
    name: 'castVote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'proposalId',
        type: 'uint256',
      },
    ],
    name: 'finalizeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'proposalId',
        type: 'uint256',
      },
    ],
    name: 'executeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'proposalId',
        type: 'uint256',
      },
    ],
    name: 'cancelProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
      },
    ],
    name: 'getActiveProposal',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
      },
    ],
    name: 'getBrandProposals',
    outputs: [
      {
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
      },
      {
        name: 'votingDuration',
        type: 'uint256',
      },
      {
        name: 'quorumPercentage',
        type: 'uint256',
      },
      {
        name: 'approvalPercentage',
        type: 'uint256',
      },
    ],
    name: 'setGovernanceParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'proposalId',
        type: 'uint256',
      },
    ],
    name: 'proposals',
    outputs: [
      {
        name: 'brandId',
        type: 'uint256',
      },
      {
        name: 'creator',
        type: 'address',
      },
      {
        name: 'tokenAmount',
        type: 'uint256',
      },
      {
        name: 'description',
        type: 'string',
      },
      {
        name: 'startTime',
        type: 'uint256',
      },
      {
        name: 'endTime',
        type: 'uint256',
      },
      {
        name: 'forVotes',
        type: 'uint256',
      },
      {
        name: 'againstVotes',
        type: 'uint256',
      },
      {
        name: 'quorum',
        type: 'uint256',
      },
      {
        name: 'minApprovalPercentage',
        type: 'uint256',
      },
      {
        name: 'status',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'proposalId',
        type: 'uint256',
      },
      {
        name: 'voter',
        type: 'address',
      },
    ],
    name: 'votes',
    outputs: [
      {
        name: 'hasVoted',
        type: 'bool',
      },
      {
        name: 'support',
        type: 'bool',
      },
      {
        name: 'voteWeight',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
      },
    ],
    name: 'brandParams',
    outputs: [
      {
        name: 'votingDuration',
        type: 'uint256',
      },
      {
        name: 'quorumPercentage',
        type: 'uint256',
      },
      {
        name: 'approvalPercentage',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'btManager',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_btManager',
        type: 'address',
      },
    ],
    name: 'updateBTManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'brandId',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'creator',
        type: 'address',
      },
      {
        indexed: false,
        name: 'tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'voter',
        type: 'address',
      },
      {
        indexed: false,
        name: 'support',
        type: 'bool',
      },
      {
        indexed: false,
        name: 'voteWeight',
        type: 'uint256',
      },
    ],
    name: 'VoteCast',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'status',
        type: 'uint8',
      },
    ],
    name: 'ProposalStatusChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: true,
        name: 'brandId',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'ProposalExecuted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'brandId',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'votingDuration',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'quorumPercentage',
        type: 'uint256',
      },
      {
        indexed: false,
        name: 'approvalPercentage',
        type: 'uint256',
      },
    ],
    name: 'GovernanceParamsSet',
    type: 'event',
  },
] as const
