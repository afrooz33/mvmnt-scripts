# 🌐 LPManager Contract Scripts

Complete collection of scripts for interacting with the LPManager smart contract - a sophisticated liquidity pool management system that orchestrates multiple pools, fee distribution, and LP token management.

## 📋 Overview

The LPManager contract is the central hub for:
- **Pool Management**: Create and manage multiple liquidity pools
- **Liquidity Operations**: Add/remove liquidity across pools
- **Fee Distribution**: Sophisticated fee sharing system
- **Multi-Stakeholder Rewards**: LP providers, LP stakers, BT stakers, and admin
- **Cross-Pool Trading**: Unified swap interface
- **Governance Controls**: Admin functions and emergency controls

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install ethers dotenv

# Set up environment variables
cp .env.example .env
# Edit .env with your values
```

### Environment Variables
```bash
# Required
LP_MANAGER_CONTRACT_ADDRESS=0x...      # LPManager contract address
BLOCKCHAIN_PROVIDER_RPCURL=https://... # RPC URL
ADMIN_KEY=0x...                        # Admin private key
USER_PRIVATE_KEY=0x...                 # User private key

# Optional
STAKING_MANAGER_CONTRACT_ADDRESS=0x... # For fee distribution
```

### Basic Usage
```bash
# Initialize LPManager
node 01-initialize.js "0xBTManager" "0xStablecoin" "0xPoolImpl" "0xDEXRouter"

# Create a new pool
node 02-createPool.js 123

# Initialize pool with liquidity
node 03-initializePool.js 123 1000 1000

# Add more liquidity
node 04-addLiquidity.js 123 1000 1000 900

# Swap tokens
node 06-swap.js 123 true 500 450

# Check pool status
node 08-getPool.js 123
node 18-getAllPools.js
```

## 📁 Script Categories

### 🔧 Core Functions (01-08)
| Script | Function | Description |
|--------|----------|-------------|
| `01-initialize.js` | `initialize` | Initialize LPManager with core addresses |
| `02-createPool.js` | `createPool` | Create new pool for a brand |
| `03-initializePool.js` | `initializePool` | Initialize pool with first liquidity |
| `04-addLiquidity.js` | `addLiquidity` | Add liquidity to existing pool |
| `05-removeLiquidity.js` | `removeLiquidity` | Remove liquidity from pool |
| `06-swap.js` | `swap` | Swap tokens across pools |
| `07-getAmountOut.js` | `getAmountOut` | Calculate swap output |
| `08-getPool.js` | `getPool` | Get pool information |

### 💰 Fee Management (09-17)
| Script | Function | Description |
|--------|----------|-------------|
| `09-onFeeCollected.js` | `onFeeCollected` | Handle fee collection from pools |
| `10-claimAdminFees.js` | `claimAdminFees` | Claim accumulated admin fees |
| `11-claimBTStakerFees.js` | `claimBTStakerFees` | Claim BT staker fees |
| `12-claimLPProviderFees.js` | `claimLPProviderFees` | Claim LP provider fees |
| `13-claimLPStakerFees.js` | `claimLPStakerFees` | Claim LP staker fees |
| `14-getPendingAdminFees.js` | `getPendingAdminFees` | Check pending admin fees |
| `15-getPendingBTStakerFees.js` | `getPendingBTStakerFees` | Check pending BT staker fees |
| `16-getPendingLPProviderFees.js` | `getPendingLPProviderFees` | Check pending LP provider fees |
| `17-getPendingLPStakerFees.js` | `getPendingLPStakerFees` | Check pending LP staker fees |

### 📊 Information Functions (18-29)
| Script | Function | Description |
|--------|----------|-------------|
| `18-getAllPools.js` | `getAllPools` | Get all pool brand IDs |
| `19-feePools.js` | `feePools` | Get fee pool information |
| `20-lpProviderFees.js` | `lpProviderFees` | Get LP provider fees for user |
| `21-userLPTokens.js` | `userLPTokens` | Get user LP tokens |
| `22-totalLPTokens.js` | `totalLPTokens` | Get total LP tokens |
| `23-brandIds.js` | `brandIds` | Get brand ID by index |
| `24-pools.js` | `pools` | Get pool address |
| `25-btManager.js` | `btManager` | Get BT manager address |
| `26-stablecoin.js` | `stablecoin` | Get stablecoin address |
| `27-poolImplementation.js` | `poolImplementation` | Get pool implementation |
| `28-dexRouter.js` | `dexRouter` | Get DEX router address |
| `29-weth.js` | `weth` | Get WETH address |

### ⚙️ Management Functions (30-35)
| Script | Function | Description |
|--------|----------|-------------|
| `30-pause.js` | `pause` | Pause LPManager operations |
| `31-unpause.js` | `unpause` | Resume LPManager operations |
| `32-paused.js` | `paused` | Check pause status |
| `33-emergencyWithdraw.js` | `emergencyWithdraw` | Emergency token withdrawal |
| `34-updateBTManager.js` | `updateBTManager` | Update BT manager address |
| `35-updateImplementation.js` | `updateImplementation` | Update pool implementation |

### 👑 Ownership Functions (36-41)
| Script | Function | Description |
|--------|----------|-------------|
| `36-owner.js` | `owner` | Get contract owner |
| `37-transferOwnership.js` | `transferOwnership` | Transfer ownership |
| `38-renounceOwnership.js` | `renounceOwnership` | Renounce ownership |
| `39-proxiableUUID.js` | `proxiableUUID` | Get proxy UUID |
| `40-upgradeTo.js` | `upgradeTo` | Upgrade implementation |
| `41-upgradeToAndCall.js` | `upgradeToAndCall` | Upgrade and initialize |

### 🔢 Constants (42-46)
| Script | Function | Description |
|--------|----------|-------------|
| `42-ADMIN_SHARE.js` | `ADMIN_SHARE` | Admin fee share percentage |
| `43-BT_STAKER_SHARE.js` | `BT_STAKER_SHARE` | BT staker fee share |
| `44-LP_PROVIDER_SHARE.js` | `LP_PROVIDER_SHARE` | LP provider fee share |
| `45-LP_STAKER_SHARE.js` | `LP_STAKER_SHARE` | LP staker fee share |
| `46-SHARE_DENOMINATOR.js` | `SHARE_DENOMINATOR` | Fee share denominator |

## 🎯 Common Use Cases

### 🌟 Pool Creation & Setup
```bash
# 1. Initialize LPManager (admin only)
node 01-initialize.js "0xBTManager" "0xStablecoin" "0xPoolImpl" "0xDEXRouter"

# 2. Create pool for brand
node 02-createPool.js 123

# 3. Initialize with first liquidity
node 03-initializePool.js 123 1000 1000

# 4. Verify pool creation
node 08-getPool.js 123
node 18-getAllPools.js
```

### 💰 Liquidity Provider Workflow
```bash
# 1. Check existing pools
node 18-getAllPools.js

# 2. Check pool info
node 08-getPool.js 123

# 3. Add liquidity
node 04-addLiquidity.js 123 1000 1000 900

# 4. Check your LP tokens
node 21-userLPTokens.js 123 "0xYourAddress"

# 5. Later: Remove liquidity
node 05-removeLiquidity.js 123 500 450 450
```

### 💱 Trader Workflow
```bash
# 1. Check available pools
node 18-getAllPools.js

# 2. Get price quote
node 07-getAmountOut.js 123 true 500

# 3. Execute swap
node 06-swap.js 123 true 500 450

# 4. Check pool after trade
node 08-getPool.js 123
```

### 🎁 Fee Management Workflow
```bash
# 1. Check pending fees
node 14-getPendingAdminFees.js 123
node 15-getPendingBTStakerFees.js 123 "0xUser"
node 16-getPendingLPProviderFees.js 123 "0xUser"
node 17-getPendingLPStakerFees.js 123 "0xUser"

# 2. Claim fees
node 10-claimAdminFees.js 123
node 11-claimBTStakerFees.js 123
node 12-claimLPProviderFees.js 123
node 13-claimLPStakerFees.js 123

# 3. Check fee pool status
node 19-feePools.js 123
```

### 🔧 Admin Management Workflow
```bash
# 1. Check system status
node 32-paused.js
node 36-owner.js

# 2. Check system configuration
node 25-btManager.js
node 26-stablecoin.js
node 27-poolImplementation.js

# 3. Emergency actions if needed
node 30-pause.js
node 33-emergencyWithdraw.js "0xToken" "0xTo" 1000
node 31-unpause.js

# 4. Update system components
node 34-updateBTManager.js "0xNewBTManager"
node 35-updateImplementation.js "0xNewImplementation"
```

## 🛠️ Advanced Features

### Fee Distribution System
LPManager implements a sophisticated 4-way fee split:
```bash
# Check fee shares
node 42-ADMIN_SHARE.js       # Admin portion
node 43-BT_STAKER_SHARE.js   # BT stakers portion
node 44-LP_PROVIDER_SHARE.js # LP providers portion
node 45-LP_STAKER_SHARE.js   # LP stakers portion
node 46-SHARE_DENOMINATOR.js # Denominator for calculations
```

### Multi-Pool Management
```bash
# Get all pools
node 18-getAllPools.js

# Check specific pool by brand
node 24-pools.js 123

# Get brand ID by index
node 23-brandIds.js 0
```

### Cross-Pool Operations
```bash
# Swap across different pools
node 06-swap.js 123 true 500 450   # Pool 123: Buy tokens
node 06-swap.js 456 false 300 250  # Pool 456: Sell tokens

# Check liquidity across pools
node 22-totalLPTokens.js 123
node 22-totalLPTokens.js 456
```

## 🔒 Security Features

### Access Control
- **Owner Functions**: Initialize, pause, unpause, emergency controls
- **Public Functions**: Add/remove liquidity, swap, view functions
- **User-Specific**: Fee claiming, LP token management

### Emergency Controls
```bash
# Pause system (owner only)
node 30-pause.js

# Emergency withdrawal (owner only)
node 33-emergencyWithdraw.js "0xToken" "0xRecipient" 1000

# Resume operations
node 31-unpause.js
```

### Upgradability
```bash
# Check current implementation
node 27-poolImplementation.js
node 39-proxiableUUID.js

# Upgrade system (owner only)
node 40-upgradeTo.js "0xNewImplementation"
node 41-upgradeToAndCall.js "0xNewImplementation" "0x"
```

## 📈 Pool Analytics

### Liquidity Metrics
```bash
# Total system liquidity
node 18-getAllPools.js | while read brandId; do
  node 22-totalLPTokens.js $brandId
  node 08-getPool.js $brandId
done
```

### Fee Analytics
```bash
# Fee distribution overview
node 19-feePools.js 123

# User fee breakdown
node 15-getPendingBTStakerFees.js 123 "0xUser"
node 16-getPendingLPProviderFees.js 123 "0xUser"
node 17-getPendingLPStakerFees.js 123 "0xUser"
```

### Trading Information
```bash
# Price discovery
node 07-getAmountOut.js 123 true 1000   # Buy 1000 stable worth
node 07-getAmountOut.js 123 false 1000  # Sell 1000 tokens
```

## 🚨 Error Handling

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| `POOL_EXISTS` | Pool already created | Use existing pool |
| `INVALID_BRAND_ID` | Brand not found | Check brand ID |
| `CONTRACT_PAUSED` | System paused | Wait or contact admin |
| `UNAUTHORIZED` | Access denied | Use correct private key |
| `InsufficientLiquidity` | Not enough liquidity | Add more liquidity |

### Troubleshooting
```bash
# Check system status
node 32-paused.js
node 36-owner.js

# Verify configuration
node 25-btManager.js
node 26-stablecoin.js

# Check pool existence
node 18-getAllPools.js
node 08-getPool.js 123
```

## 📚 Technical Details

### Fee Distribution Model
- **LP Providers**: Earn fees from trading in their pools
- **LP Stakers**: Earn additional rewards for staking LP tokens
- **BT Stakers**: Earn fees from all pools in the ecosystem
- **Admin**: Platform maintenance and development fees

### Pool Architecture
- **Proxy Pattern**: Upgradeable pool implementations
- **Factory Pattern**: LPManager creates standardized pools
- **Fee Collection**: Automatic fee distribution on trades
- **Multi-Token Support**: Each pool supports brand token + stablecoin

### Integration Points
- **StakingManager**: For LP and BT staking rewards
- **BTManager**: For brand token management
- **DEX Router**: For external DEX integrations
- **Pool Implementation**: Standardized pool logic

## 🔗 Related Contracts

- **Pool Contract**: Individual liquidity pools
- **StakingManager**: LP and BT token staking
- **BTManager**: Brand token management
- **WETH**: Wrapped ETH for trading

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add comprehensive tests
4. Submit a pull request

## 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review error messages carefully
- Test with small amounts first
- Contact the development team

---

**⚠️ Important**: Always test with small amounts first and verify all addresses before large transactions! 