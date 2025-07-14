# 🚀 StakingManager Scripts Collection

Complete collection of **38 individual scripts** for all StakingManager contract functions. Each script can be run independently to execute specific contract functions.

## 📋 **Quick Start**

### 1. Generate All Scripts
```bash
# Run the script generator to create all 31 remaining scripts
node generate-remaining-scripts.js
```

### 2. Setup Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
vim .env
```

### 3. Run Any Script
```bash
# Example: Stake brand tokens
node 04-stakeBrandToken.js "brand-123" 1000 2592000

# Example: Check user stakes
node 09-getUserStakes.js "brand-123" "0x1234..."

# Example: Get current APY
node 15-getCurrentAPY.js "brand-123"
```

## 📁 **Script Categories**

### **🏗️ Setup Functions (01-02)**
- `01-constructor.js` - Deploy StakingManager contract
- `02-initialize.js` - Initialize contract with BTManager

### **⚙️ Configuration (03)**
- `03-setStakingConfig.js` - Set brand staking configuration

### **🪙 Core Staking (04-07)**
- `04-stakeBrandToken.js` - Stake brand tokens
- `05-stakeLPToken.js` - Stake LP tokens
- `06-unstake.js` - Unstake tokens after lock period
- `07-claimReward.js` - Claim pending rewards

### **📊 Data Fetching (08-14)**
- `08-calculateReward.js` - Calculate pending rewards
- `09-getUserStakes.js` - Get all user stakes
- `10-hasActiveStake.js` - Check if user has active stakes
- `11-getTotalStaked.js` - Get total staked amount
- `12-getTotalLPStaked.js` - Get total LP staked amount
- `13-getTotalUserStake.js` - Get user's total stake
- `14-getStakingConfigValues.js` - Get staking configuration

### **📈 Analytics & APY (15-19)**
- `15-getCurrentAPY.js` - Get current APY data
- `16-getAPYHistory.js` - Get historical APY data
- `17-calculateTVL.js` - Calculate Total Value Locked
- `18-calculateBrandTokenAPY.js` - Calculate brand token APY
- `19-calculateLPTokenAPY.js` - Calculate LP token APY

### **🎚️ Control Functions (20-24)**
- `20-pauseBrandStaking.js` - Pause brand staking
- `21-unpauseBrandStaking.js` - Resume brand staking
- `22-pause.js` - Emergency pause entire contract
- `23-unpause.js` - Resume entire contract
- `24-updateBTManager.js` - Update BTManager address

### **🔄 External Functions (25-26)**
- `25-notifyTradingVolume.js` - Notify trading volume
- `26-updateAPY.js` - Update APY data

### **🔧 Backward Compatibility (27-38)**
- `27-hasActiveStakeUint.js` - Uint version of hasActiveStake
- `28-stakeBrandTokenUint.js` - Uint version of stakeBrandToken
- `29-stakeLPTokenUint.js` - Uint version of stakeLPToken
- `30-unstakeUint.js` - Uint version of unstake
- `31-claimRewardUint.js` - Uint version of claimReward
- `32-getTotalUserStakeUint.js` - Uint version of getTotalUserStake
- `33-getTotalStakedUint.js` - Uint version of getTotalStaked
- `34-getTotalLPStakedUint.js` - Uint version of getTotalLPStaked
- `35-calculateRewardUint.js` - Uint version of calculateReward
- `36-getUserStakesUint.js` - Uint version of getUserStakes
- `37-getStakingConfigValuesUint.js` - Uint version of getStakingConfigValues
- `38-getCurrentAPYUint.js` - Uint version of getCurrentAPY

## 🔧 **Environment Setup**

Create `.env` file with required variables:

```env
# Blockchain Configuration
BLOCKCHAIN_PROVIDER_RPCURL=https://your-rpc-url
BLOCKCHAIN_CHAIN_ID=1
ADMIN_KEY=your-admin-private-key
USER_PRIVATE_KEY=your-user-private-key

# Contract Addresses
STAKING_MANAGER_CONTRACT_ADDRESS=0x...
BRAND_MANAGER_ADDRESS=0x...
LP_MANAGER=0x...

# Optional
NODE_ENV=development
```

## 📖 **Usage Examples**

### **Deploy and Initialize**
```bash
# 1. Deploy contract
node 01-constructor.js

# 2. Initialize with BTManager
node 02-initialize.js 0xBTManagerAddress

# 3. Set staking configuration
node 03-setStakingConfig.js "brand-123" 0.1 0.05 31536000 100
```

### **User Staking Flow**
```bash
# 1. Stake brand tokens
node 04-stakeBrandToken.js "brand-123" 1000 2592000

# 2. Check stakes
node 09-getUserStakes.js "brand-123" "0xUserAddress"

# 3. Calculate rewards
node 08-calculateReward.js "brand-123" "0xUserAddress" 1

# 4. Claim rewards
node 07-claimReward.js "brand-123" 1

# 5. Unstake after lock period
node 06-unstake.js "brand-123" 1
```

### **Analytics Dashboard**
```bash
# Get current APY
node 15-getCurrentAPY.js "brand-123"

# Get TVL
node 17-calculateTVL.js "brand-123"

# Get total staked amounts
node 11-getTotalStaked.js "brand-123"
node 12-getTotalLPStaked.js "brand-123"

# Get APY history
node 16-getAPYHistory.js "brand-123"
```

### **Admin Controls**
```bash
# Pause brand staking
node 20-pauseBrandStaking.js "brand-123"

# Resume brand staking
node 21-unpauseBrandStaking.js "brand-123"

# Emergency pause (owner only)
node 22-pause.js

# Resume contract (owner only)
node 23-unpause.js
```

## 🎯 **Script Features**

### **✅ Comprehensive Error Handling**
- Contract-specific error detection
- User-friendly error messages
- Proper exit codes for automation

### **📊 Detailed Logging**
- Transaction hashes
- Gas usage tracking
- Parameter validation
- Result verification

### **🔄 Automatic Verification**
- Post-transaction verification
- State change confirmation
- Event parsing for results

### **⚡ Performance Optimized**
- Token balance checks
- Allowance verification
- Gas estimation
- Transaction batching support

## 🛠️ **Development Tools**

### **Generate Scripts**
```bash
# Generate all remaining scripts
node generate-remaining-scripts.js

# Check generated files
ls -la *.js | wc -l  # Should show 39 files (38 scripts + 1 generator)
```

### **Batch Operations**
```javascript
// Using the index file for batch operations
const scripts = require('./index.js');

// Run multiple scripts programmatically
const result1 = await scripts.runGetUserStakes('brand-123', userAddress);
const result2 = await scripts.runCalculateReward('brand-123', userAddress, 1);
```

### **Testing Scripts**
```bash
# Test on testnet first
export NODE_ENV=testnet
export BLOCKCHAIN_PROVIDER_RPCURL=https://testnet-rpc-url

# Run test stakes
node 04-stakeBrandToken.js "test-brand" 1 3600  # 1 hour lock for testing
```

## 🔒 **Security Best Practices**

### **Private Key Management**
- Never commit private keys to git
- Use environment variables
- Consider using hardware wallets for production
- Implement key rotation for long-term usage

### **Transaction Safety**
- Always test on testnet first
- Verify contract addresses
- Check gas prices before execution
- Monitor transaction status

### **Access Control**
- Use appropriate private keys for different operations
- Implement multi-sig for admin functions
- Log all administrative actions
- Regular security audits

## 📈 **Monitoring and Analytics**

### **Real-time Monitoring**
```bash
# Monitor staking activity
watch -n 30 "node 11-getTotalStaked.js brand-123"

# Track APY changes
watch -n 300 "node 15-getCurrentAPY.js brand-123"

# Monitor user stakes
watch -n 60 "node 09-getUserStakes.js brand-123 0xUserAddress"
```

### **Data Export**
```bash
# Export staking data for analysis
node 09-getUserStakes.js "brand-123" "0xUser" > stakes.json
node 16-getAPYHistory.js "brand-123" > apy-history.json
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Contract not found"**
   - Check STAKING_MANAGER_CONTRACT_ADDRESS in .env
   - Verify network connection
   - Confirm contract deployment

2. **"Insufficient funds"**
   - Check token balance
   - Verify token allowance
   - Ensure sufficient ETH for gas

3. **"Stake locked"**
   - Check lock period expiration
   - Calculate remaining time
   - Wait for unlock or use different stake

4. **"No rewards to claim"**
   - Verify stake is active
   - Check reward calculation
   - Ensure sufficient time has passed

### **Debug Mode**
```bash
# Enable debug logging
export DEBUG=staking:*
node 04-stakeBrandToken.js "brand-123" 1000 2592000
```

## 📚 **Additional Resources**

- [StakingManager Contract Documentation](../docs/StakingManager.md)
- [Frontend Integration Guide](../docs/Frontend-Integration.md)
- [API Reference](../docs/API-Reference.md)
- [Troubleshooting Guide](../docs/Troubleshooting.md)

## 🤝 **Contributing**

1. Test all scripts on testnet
2. Follow existing code patterns
3. Add comprehensive error handling
4. Update documentation
5. Submit pull request with test results

---

## 📊 **Quick Reference**

| Function Category | Script Range | Count | Description |
|-------------------|--------------|-------|-------------|
| Setup | 01-02 | 2 | Contract deployment and initialization |
| Configuration | 03 | 1 | Staking configuration management |
| Core Staking | 04-07 | 4 | Main staking operations |
| Data Fetching | 08-14 | 7 | Read-only data retrieval |
| Analytics | 15-19 | 5 | APY and performance metrics |
| Control | 20-24 | 5 | Administrative controls |
| External | 25-26 | 2 | External system integration |
| Legacy | 27-38 | 12 | Backward compatibility functions |
| **Total** | **01-38** | **38** | **Complete function coverage** |

**Generated by StakingManager Script Collection v1.0** 