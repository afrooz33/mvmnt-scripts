const LPManagerABI = [
    {
      type: 'constructor',
      inputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'receive',
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'ADMIN_SHARE',
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
      name: 'BT_STAKER_SHARE',
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
      name: 'LP_PROVIDER_SHARE',
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
      name: 'LP_STAKER_SHARE',
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
      name: 'SHARE_DENOMINATOR',
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
      name: 'addLiquidity',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'tokenAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'stableAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'minLpAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: 'lpAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'brandIds',
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
      name: 'claimAdminFees',
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
      name: 'claimBTStakerFees',
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
      name: 'claimLPProviderFees',
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
      name: 'claimLPStakerFees',
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
      name: 'createPool',
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
          type: 'address',
          internalType: 'address',
        },
      ],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'dexRouter',
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
      name: 'emergencyWithdraw',
      inputs: [
        {
          name: 'token',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'to',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'amount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'feePools',
      inputs: [
        {
          name: '',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: 'lpProviderFees',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'lpStakerFees',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'btStakerFees',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'adminFees',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'lastDistribution',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getAllPools',
      inputs: [],
      outputs: [
        {
          name: '',
          type: 'uint256[]',
          internalType: 'uint256[]',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getAmountOut',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'isBuyToken',
          type: 'bool',
          internalType: 'bool',
        },
        {
          name: 'amountIn',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: 'amountOut',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'getPendingAdminFees',
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
      name: 'getPendingBTStakerFees',
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
      name: 'getPendingLPProviderFees',
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
      name: 'getPendingLPStakerFees',
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
      name: 'getPool',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: 'poolAddress',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'tokenReserve',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'stableReserve',
          type: 'uint256',
          internalType: 'uint256',
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
        {
          name: '_stablecoin',
          type: 'address',
          internalType: 'address',
        },
        {
          name: '_poolImplementation',
          type: 'address',
          internalType: 'address',
        },
        {
          name: '_dexRouter',
          type: 'address',
          internalType: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'initializePool',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'tokenAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'stableAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [],
      stateMutability: 'payable',
    },
    {
      type: 'function',
      name: 'lpProviderFees',
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
      name: 'onFeeCollected',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'feeAmount',
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
      name: 'poolImplementation',
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
      name: 'pools',
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
          type: 'address',
          internalType: 'address',
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
      name: 'removeLiquidity',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'lpAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'minTokenAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'minStableAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: 'tokenAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'stableAmount',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
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
      name: 'stablecoin',
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
      name: 'swap',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'isBuyToken',
          type: 'bool',
          internalType: 'bool',
        },
        {
          name: 'amountIn',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'minAmountOut',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      outputs: [
        {
          name: 'amountOut',
          type: 'uint256',
          internalType: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'totalLPTokens',
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
      name: 'updateImplementation',
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
      name: 'userLPTokens',
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
      name: 'weth',
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
      name: 'FeeClaimed',
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
          name: 'feeType',
          type: 'uint8',
          indexed: false,
          internalType: 'enum LPManager.FeeType',
        },
        {
          name: 'amount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'FeeCollected',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'totalFee',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'lpProviderShare',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'lpStakerShare',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'btStakerShare',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'adminShare',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'ImplementationUpdated',
      inputs: [
        {
          name: 'oldImplementation',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
        {
          name: 'newImplementation',
          type: 'address',
          indexed: false,
          internalType: 'address',
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
      name: 'PoolCreated',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'poolAddress',
          type: 'address',
          indexed: true,
          internalType: 'address',
        },
        {
          name: 'tokenAddress',
          type: 'address',
          indexed: false,
          internalType: 'address',
        },
      ],
      anonymous: false,
    },
    {
      type: 'event',
      name: 'PoolInitialized',
      inputs: [
        {
          name: 'brandId',
          type: 'uint256',
          indexed: true,
          internalType: 'uint256',
        },
        {
          name: 'tokenAmount',
          type: 'uint256',
          indexed: false,
          internalType: 'uint256',
        },
        {
          name: 'stableAmount',
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
      name: 'InsufficientBalance',
      inputs: [
        {
          name: 'token',
          type: 'address',
          internalType: 'address',
        },
        {
          name: 'required',
          type: 'uint256',
          internalType: 'uint256',
        },
        {
          name: 'available',
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
      name: 'PoolAlreadyExists',
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
      name: 'PoolDoesNotExist',
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
    {
      type: 'error',
      name: 'ZeroAmount',
      inputs: [],
    },
  ];
  
module.exports = { LPManagerABI }; 