# 🏊 Pool Contract Scripts

Complete collection of scripts for interacting with the Pool smart contract - a decentralized liquidity pool supporting brand tokens and stablecoins.

## 📋 Overview

The Pool contract is a sophisticated AMM (Automated Market Maker) that enables:
- **Liquidity Provision**: Add/remove liquidity to earn LP tokens
- **Token Swapping**: Trade between brand tokens and stablecoins
- **Price Management**: Automated price discovery with bounds
- **Fee Collection**: Configurable trading fees
- **Emergency Controls**: Pause/unpause and emergency withdrawals

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
POOL_CONTRACT_ADDRESS=0x...           # Pool contract address
BLOCKCHAIN_PROVIDER_RPCURL=https://... # RPC URL
ADMIN_KEY=0x...                       # Admin private key
USER_PRIVATE_KEY=0x...                # User private key

# Optional
LP_MANAGER=0x...                      # LP Manager address
```

### Basic Usage
```bash
# Initialize pool
node 01-initialize.js "0xBrandToken" "0xStablecoin" "123" "0xManager"

# Add liquidity
node 02-addLiquidity.js 1000 1000 900

# Swap tokens
node 04-swap.js true 500 450  # Buy tokens with stable
node 04-swap.js false 500 450 # Sell tokens for stable

# Remove liquidity
node 03-removeLiquidity.js 500 450 450

# Check pool info
node 11-getCurrentPrice.js
node 18-tokenReserve.js
node 19-stableReserve.js
```

## 📁 Script Categories

### 🔧 Core Functions (01-05)
| Script | Function | Description |
|--------|----------|-------------|
| `01-initialize.js` | `initialize` | Initialize pool with tokens and manager |
| `02-addLiquidity.js` | `addLiquidity` | Add liquidity to pool |
| `03-removeLiquidity.js` | `removeLiquidity` | Remove liquidity from pool |
| `04-swap.js` | `swap` | Swap tokens in the pool |
| `05-getAmountOut.js` | `getAmountOut` | Calculate swap output |

### ⚙️ Management Functions (06-10)
| Script | Function | Description |
|--------|----------|-------------|
| `06-updateReferencePrice.js` | `updateReferencePrice` | Update reference price |
| `07-pause.js` | `pause` | Pause pool operations |
| `08-unpause.js` | `unpause` | Resume pool operations |
| `09-setFee.js` | `setFee` | Set trading fee |
| `10-emergencyWithdraw.js` | `emergencyWithdraw` | Emergency token withdrawal |

### 📊 Information Functions (11-23)
| Script | Function | Description |
|--------|----------|-------------|
| `11-getCurrentPrice.js` | `getCurrentPrice` | Get current token price |
| `12-getPriceBounds.js` | `getPriceBounds` | Get price bounds |
| `13-getPriceInfo.js` | `getPriceInfo` | Get comprehensive price info |
| `14-paused.js` | `paused` | Check if pool is paused |
| `15-brandId.js` | `brandId` | Get brand ID |
| `16-brandToken.js` | `brandToken` | Get brand token address |
| `17-stablecoin.js` | `stablecoin` | Get stablecoin address |
| `18-tokenReserve.js` | `tokenReserve` | Get token reserve |
| `19-stableReserve.js` | `stableReserve` | Get stable reserve |
| `20-manager.js` | `manager` | Get manager address |
| `21-fee.js` | `fee` | Get current fee |
| `22-referencePrice.js` | `referencePrice` | Get reference price |
| `23-lastReferenceUpdate.js` | `lastReferenceUpdate` | Get last update time |

### 🪙 ERC20 Functions (24-29)
| Script | Function | Description |
|--------|----------|-------------|
| `24-totalSupply.js` | `totalSupply` | Get total LP supply |
| `25-balanceOf.js` | `balanceOf` | Get LP balance |
| `26-allowance.js` | `allowance` | Get LP allowance |
| `27-approve.js` | `approve` | Approve LP spending |
| `28-transfer.js` | `transfer` | Transfer LP tokens |
| `29-transferFrom.js` | `transferFrom` | Transfer LP tokens from |

### 🔢 Constants (30-36)
| Script | Function | Description |
|--------|----------|-------------|
| `30-DEFAULT_FEE.js` | `DEFAULT_FEE` | Default fee constant |
| `31-FEE_DENOMINATOR.js` | `FEE_DENOMINATOR` | Fee denominator |
| `32-PRECISION.js` | `PRECISION` | Precision constant |
| `33-REFERENCE_UPDATE_INTERVAL.js` | `REFERENCE_UPDATE_INTERVAL` | Update interval |
| `34-UPPER_BAND_MULTIPLIER.js` | `UPPER_BAND_MULTIPLIER` | Upper band multiplier |
| `35-LOWER_BAND_MULTIPLIER.js` | `LOWER_BAND_MULTIPLIER` | Lower band multiplier |
| `36-BAND_DENOMINATOR.js` | `BAND_DENOMINATOR` | Band denominator |

## 🎯 Common Use Cases

### 🌟 Liquidity Provider Workflow
```bash
# 1. Check current reserves
node 18-tokenReserve.js
node 19-stableReserve.js

# 2. Add liquidity
node 02-addLiquidity.js 1000 1000 900

# 3. Check LP balance
node 25-balanceOf.js "0xYourAddress"

# 4. Later: Remove liquidity
node 03-removeLiquidity.js 500 450 450
```

### 💱 Trader Workflow
```bash
# 1. Check current price
node 11-getCurrentPrice.js

# 2. Calculate expected output
node 05-getAmountOut.js true 500

# 3. Execute swap
node 04-swap.js true 500 450

# 4. Check new price
node 11-getCurrentPrice.js
```

### 🔧 Pool Manager Workflow
```bash
# 1. Check pool status
node 14-paused.js
node 21-fee.js

# 2. Update settings
node 09-setFee.js 30  # 0.3% fee

# 3. Update reference price
node 06-updateReferencePrice.js

# 4. Emergency actions if needed
node 07-pause.js
node 10-emergencyWithdraw.js "0xToken" "0xTo" 1000
```

## 🛠️ Advanced Features

### Price Bounds System
The pool uses a price band system to prevent extreme price movements:
```bash
# Check price bounds
node 12-getPriceBounds.js

# Get comprehensive price info
node 13-getPriceInfo.js
```

### Reference Price Updates
```bash
# Manual update
node 06-updateReferencePrice.js

# Check last update time
node 23-lastReferenceUpdate.js

# Check update interval
node 33-REFERENCE_UPDATE_INTERVAL.js
```

## 🔒 Security Features

### Emergency Controls
```bash
# Pause pool (admin only)
node 07-pause.js

# Emergency withdrawal (admin only)
node 10-emergencyWithdraw.js "0xToken" "0xRecipient" 1000

# Resume operations
node 08-unpause.js
```

### Access Control
- **Admin Functions**: Initialize, pause, unpause, setFee, emergencyWithdraw
- **Public Functions**: addLiquidity, removeLiquidity, swap, view functions
- **User Functions**: ERC20 functions for LP tokens

## 📈 Pool Analytics

### Liquidity Metrics
```bash
# Total liquidity
node 18-tokenReserve.js
node 19-stableReserve.js
node 24-totalSupply.js

# Price information
node 11-getCurrentPrice.js
node 22-referencePrice.js
```

### Trading Information
```bash
# Current fee
node 21-fee.js

# Price bounds
node 12-getPriceBounds.js

# Calculate trade impact
node 05-getAmountOut.js true 1000
```

## 🚨 Error Handling

### Common Errors
| Error | Cause | Solution |
|-------|-------|----------|
| `InsufficientLiquidity` | Not enough liquidity | Add more liquidity or reduce amount |
| `SlippageTooHigh` | Price moved too much | Increase slippage tolerance |
| `InvalidAmount` | Invalid amount provided | Check amount format and value |
| `Unauthorized` | Access denied | Use correct admin key |
| `Pool is paused` | Pool operations paused | Wait or contact admin |

### Troubleshooting
```bash
# Check pool status
node 14-paused.js

# Check your balances
node 25-balanceOf.js "0xYourAddress"

# Check allowances
node 26-allowance.js "0xYourAddress" "0xPoolAddress"

# Verify contract addresses
node 16-brandToken.js
node 17-stablecoin.js
```

## 📚 Technical Details

### Pool Mathematics
- **Constant Product**: Uses x * y = k formula
- **Price Bands**: Prevents extreme price movements
- **Fee System**: Configurable trading fees
- **Slippage Protection**: Minimum amount out checks

### Gas Optimization
- **Batch Operations**: Use multiple functions in one transaction
- **Proper Approvals**: Only approve what you need
- **View Functions**: Use for calculations (free)

## 🔗 Related Contracts

- **Brand Token**: ERC20 token being traded
- **Stablecoin**: Stable asset (USDC, USDT, etc.)
- **LP Manager**: Manages multiple pools
- **Pool Manager**: Administrative controls

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📞 Support

For technical support or questions:
- Check the troubleshooting section
- Review error messages carefully
- Test with small amounts first
- Contact the development team

---

**⚠️ Important**: Always test with small amounts first and verify contract addresses before large transactions! 