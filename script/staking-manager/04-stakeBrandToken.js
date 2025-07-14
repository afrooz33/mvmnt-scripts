/**
 * 04-stakeBrandToken.js
 * StakingManager StakeBrandToken Script
 * Purpose: Stakes brand tokens for a user
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runStakeBrandToken(brandId, amount, lockPeriod, userPrivateKey = null) {
    try {
        console.log('🚀 Starting StakeBrandToken Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Staker Address:', await signer.getAddress());
        
        // Get contract address
        const stakingManagerAddress = process.env.STAKING_MANAGER_CONTRACT_ADDRESS;
        if (!stakingManagerAddress) {
            throw new Error('❌ STAKING_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandId || !amount || !lockPeriod) {
            throw new Error('❌ Brand ID, amount, and lock period are required');
        }
        
        // Convert inputs to proper formats
        const stakeAmount = ethers.parseEther(amount.toString());
        const lockDuration = parseInt(lockPeriod);
        
        console.log('🎯 Staking Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Amount:', ethers.formatEther(stakeAmount), 'tokens');
        console.log('   - Lock Period:', lockDuration, 'seconds');
        
        // Load contracts
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.ts');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        // Get brand token address (assuming we have BTManager)
        const btManagerAddress = process.env.BRAND_MANAGER_ADDRESS;
        if (btManagerAddress) {
                            // Load BTManager contract
        const BTManagerABI = require('./abi/BTManager.abi.ts').default;
        const BTManager = new ethers.Contract(btManagerAddress, BTManagerABI, signer);
            try {
                const brandTokenAddress = await BTManager.getBrandToken(brandId);
                console.log('🪙 Brand Token Address:', brandTokenAddress);
                
                // Check if user has enough tokens
                                // Load BrandToken contract
        const { IERC20ABI } = require('./abi/IERC20.abi.ts');
        const BrandToken = new ethers.Contract(brandTokenAddress, IERC20ABI, signer);
                const balance = await BrandToken.balanceOf(await signer.getAddress());
                console.log('💰 User Balance:', ethers.formatEther(balance), 'tokens');
                
                if (balance < stakeAmount) {
                    throw new Error('❌ Insufficient brand token balance');
                }
                
                // Check allowance
                const allowance = await BrandToken.allowance(await signer.getAddress(), stakingManagerAddress);
                console.log('✅ Current Allowance:', ethers.formatEther(allowance), 'tokens');
                
                if (allowance < stakeAmount) {
                    console.log('⏳ Approving tokens for staking...');
                    const approveTx = await BrandToken.approve(stakingManagerAddress, stakeAmount);
                    await approveTx.wait();
                    console.log('✅ Approval completed');
                }
            } catch (err) {
                console.warn('⚠️ Could not check token balance/allowance:', err.message);
            }
        }
        
        console.log('⏳ Staking brand tokens...');
        
        const tx = await StakingManager.stakeBrandToken(brandId, stakeAmount, lockDuration);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Parse events to get stake ID
        let stakeId = null;
        for (const log of receipt.logs) {
            try {
                const parsedLog = StakingManager.interface.parseLog(log);
                if (parsedLog.name === 'Staked') {
                    stakeId = parsedLog.args.stakeId.toString();
                    console.log('🆔 Stake ID:', stakeId);
                    break;
                }
            } catch (err) {
                // Not a StakingManager event
            }
        }
        
        // Verify stake was created
        try {
            const userStakes = await StakingManager.getUserStakes(brandId, await signer.getAddress());
            console.log('📊 Total User Stakes:', userStakes.length);
            
            console.log('🎉 StakeBrandToken completed successfully!');
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                stakeId: stakeId,
                brandId: brandId,
                amount: ethers.formatEther(stakeAmount),
                lockPeriod: lockDuration
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                stakeId: stakeId,
                warning: 'Could not verify stake creation'
            };
        }
        
    } catch (error) {
        console.error('❌ StakeBrandToken failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('BrandNotConfigured')) {
            return {
                success: false,
                error: 'Brand staking not configured',
                code: 'BRAND_NOT_CONFIGURED'
            };
        }
        
        if (error.message.includes('StakingPaused')) {
            return {
                success: false,
                error: 'Brand staking is currently paused',
                code: 'STAKING_PAUSED'
            };
        }
        
        if (error.message.includes('InvalidStakeAmount')) {
            return {
                success: false,
                error: 'Stake amount is below minimum required',
                code: 'INVALID_STAKE_AMOUNT'
            };
        }
        
        if (error.message.includes('InvalidLockPeriod')) {
            return {
                success: false,
                error: 'Lock period exceeds maximum allowed',
                code: 'INVALID_LOCK_PERIOD'
            };
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandId, amount, lockPeriod, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !amount || !lockPeriod) {
        console.error('❌ Usage: node 04-stakeBrandToken.js <brandId> <amount> <lockPeriod> [userPrivateKey]');
        console.error('   Example: node 04-stakeBrandToken.js "brand-123" 1000 2592000');
        process.exit(1);
    }
    
    runStakeBrandToken(brandId, amount, lockPeriod, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runStakeBrandToken }; 