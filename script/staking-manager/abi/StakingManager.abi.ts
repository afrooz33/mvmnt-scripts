export const StakingManagerABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'APY_HISTORY_POINTS',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'APY_PRECISION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'APY_UPDATE_INTERVAL',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'REWARD_PRECISION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'SECONDS_IN_YEAR',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'accumulatedVolume',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'apyHistory',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'timestamp',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'btAPY',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lpAPY',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'tradingVolume',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'totalValueLocked',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'btManager',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IBTManager',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateBrandTokenAPY',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateLPTokenAPY',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateReward',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'reward',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'calculateTVL',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimReward',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'reward',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAPYHistory',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct StakingManager.APYData[]',
        components: [
          {
            name: 'timestamp',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'btAPY',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'lpAPY',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'tradingVolume',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'totalValueLocked',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getCurrentAPY',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'btAPY',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lpAPY',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'tradingVolume',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'tvl',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalLPStaked',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalStaked',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTotalUserStake',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserStakes',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct StakingManager.Stake[]',
        components: [
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'startTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'lockPeriod',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'lastClaimTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'isLPToken',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'active',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasActiveStake',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'isLPToken',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'hasStake',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_btManager',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'lastAPYUpdate',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'notifyTradingVolume',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'volume',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pauseBrandStaking',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rewardsDistributed',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setStakingConfig',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'baseRewardRate',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'bonusRewardRate',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxLockPeriod',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minStakeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'stakeBrandToken',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lockPeriod',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'stakeLPToken',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lockPeriod',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'stakes',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'startTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lockPeriod',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lastClaimTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isLPToken',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'active',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'stakingConfigs',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'baseRewardRate',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'bonusRewardRate',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxLockPeriod',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minStakeAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'paused',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalLPStaked',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalStaked',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpauseBrandStaking',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unstake',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateAPY',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateBTManager',
    inputs: [
      {
        name: '_btManager',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeTo',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'APYUpdated',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'btAPY',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lpAPY',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'tradingVolume',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'tvl',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'AdminChanged',
    inputs: [
      {
        name: 'previousAdmin',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newAdmin',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BeaconUpgraded',
    inputs: [
      {
        name: 'beacon',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BrandStakingPaused',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BrandStakingUnpaused',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Paused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardClaimed',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Staked',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lockPeriod',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'isLPToken',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'StakingConfigSet',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'baseRewardRate',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'bonusRewardRate',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'maxLockPeriod',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unpaused',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Unstaked',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'isLPToken',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'BrandNotConfigured',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidLockPeriod',
    inputs: [
      {
        name: 'period',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maximum',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidParameters',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidStakeAmount',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minimum',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'NoRewardsToClaim',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'StakeLocked',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'unlockTime',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'StakeNotActive',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'StakeNotFound',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'stakeId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'StakingPaused',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [
      {
        name: 'caller',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
] as const
