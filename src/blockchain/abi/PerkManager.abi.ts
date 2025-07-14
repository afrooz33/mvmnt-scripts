// Generated ABI for PerkManager
// Last updated: 2025-04-15T06:26:45.010Z

export const PerkManagerABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'brandPerks',
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
        name: '',
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
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkEligibility',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
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
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'claimNFTPerk',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimPerk',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimedNFTs',
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
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'configureNFTPerk',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'config',
        type: 'tuple',
        internalType: 'struct PerkManager.NFTPerkConfig',
        components: [
          {
            name: 'perkType',
            type: 'uint8',
            internalType: 'enum PerkNFT.PerkType',
          },
          {
            name: 'discountAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'discountPercent',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxUses',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'duration',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'transferable',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createPerk',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'params',
        type: 'tuple',
        internalType: 'struct PerkManager.PerkCreationParams',
        components: [
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'description',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'perkType',
            type: 'uint8',
            internalType: 'enum PerkManager.PerkType',
          },
          {
            name: 'minHoldingAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minHoldingDuration',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'startTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'endTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'requiresStaking',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'requiresLPStaking',
            type: 'bool',
            internalType: 'bool',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'eligibility',
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
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'isEligible',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'isClaimed',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'claimTime',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAvailablePerks',
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
        name: 'availablePerks',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBrandPerks',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'perkIds',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPerk',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct PerkManager.Perk',
        components: [
          {
            name: 'brandId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'description',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'perkType',
            type: 'uint8',
            internalType: 'enum PerkManager.PerkType',
          },
          {
            name: 'minHoldingAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minHoldingDuration',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'startTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'endTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'status',
            type: 'uint8',
            internalType: 'enum PerkManager.PerkStatus',
          },
          {
            name: 'requiresStaking',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'requiresLPStaking',
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
    name: 'getPerkDetails',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'perk',
        type: 'tuple',
        internalType: 'struct PerkManager.Perk',
        components: [
          {
            name: 'brandId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'description',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'perkType',
            type: 'uint8',
            internalType: 'enum PerkManager.PerkType',
          },
          {
            name: 'minHoldingAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minHoldingDuration',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'startTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'endTime',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'status',
            type: 'uint8',
            internalType: 'enum PerkManager.PerkStatus',
          },
          {
            name: 'requiresStaking',
            type: 'bool',
            internalType: 'bool',
          },
          {
            name: 'requiresLPStaking',
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
    name: 'isEligibleForPerk',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
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
        name: 'isEligible',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nftPerkConfigs',
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
        name: 'perkType',
        type: 'uint8',
        internalType: 'enum PerkNFT.PerkType',
      },
      {
        name: 'discountAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'discountPercent',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxUses',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'duration',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'transferable',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'notifyStake',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isLPToken',
        type: 'bool',
        internalType: 'bool',
      },
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
    name: 'notifyUnstake',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'isLPToken',
        type: 'bool',
        internalType: 'bool',
      },
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
    name: 'perkNFT',
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
    name: 'perks',
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
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'description',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'perkType',
        type: 'uint8',
        internalType: 'enum PerkManager.PerkType',
      },
      {
        name: 'minHoldingAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minHoldingDuration',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'startTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'endTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'status',
        type: 'uint8',
        internalType: 'enum PerkManager.PerkStatus',
      },
      {
        name: 'requiresStaking',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'requiresLPStaking',
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
    name: 'setPerkNFT',
    inputs: [
      {
        name: '_perkNFT',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'snapshots',
    inputs: [
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
        name: 'totalHolders',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'takeSnapshot',
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
    name: 'updateHolding',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
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
    name: 'updatePerkInfo',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'name',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'description',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'perkType',
        type: 'uint8',
        internalType: 'enum PerkManager.PerkType',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updatePerkRequirements',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minHoldingAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'minHoldingDuration',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'startTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'endTime',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'requiresStaking',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'requiresLPStaking',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updatePerkStatus',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'status',
        type: 'uint8',
        internalType: 'enum PerkManager.PerkStatus',
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
    type: 'function',
    name: 'userHoldingStartTime',
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
    name: 'userHoldings',
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
    name: 'userLPHoldings',
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
    name: 'HoldingUpdated',
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
    name: 'NFTPerkClaimed',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'perkId',
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
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NFTPerkConfigured',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'perkType',
        type: 'uint8',
        indexed: false,
        internalType: 'enum PerkNFT.PerkType',
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
    name: 'PerkClaimed',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'perkId',
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
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PerkCreated',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'name',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'perkType',
        type: 'uint8',
        indexed: false,
        internalType: 'enum PerkManager.PerkType',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PerkUpdated',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'status',
        type: 'uint8',
        indexed: false,
        internalType: 'enum PerkManager.PerkStatus',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SnapshotTaken',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'timestamp',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalHolders',
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
    name: 'AlreadyClaimed',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'BrandIdRequired',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidAddress',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidBrandId',
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
    name: 'InvalidNFTConfig',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidParameters',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NFTAlreadyClaimed',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'NotEligible',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'PerkNFTNotSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PerkNotActive',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'PerkNotFound',
    inputs: [
      {
        name: 'brandId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'perkId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'SnapshotTooRecent',
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

// TypeScript interface for the contract
export type PerkManagerInterface = typeof PerkManagerABI
