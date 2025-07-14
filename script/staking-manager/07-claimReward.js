/**
 * 07-claimReward.js
 * StakingManager ClaimReward Script
 * Purpose: Claims pending rewards for a stake
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runClaimReward(brandId, stakeId, userPrivateKey = null) {
    try {
        console.log('🚀 Starting ClaimReward Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Claimer Address:', await signer.getAddress());
        
        // Get contract address
        const stakingManagerAddress = process.env.STAKING_MANAGER_CONTRACT_ADDRESS;
        if (!stakingManagerAddress) {
            throw new Error('❌ STAKING_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandId || !stakeId) {
            throw new Error('❌ Brand ID and stake ID are required');
        }
        
        console.log('🎯 Claim Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Stake ID:', stakeId);
        
        // Load contracts
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        // Calculate pending reward before claiming
        try {
            const pendingReward = await StakingManager.calculateReward(brandId, await signer.getAddress(), stakeId);
            console.log('💰 Pending Reward:', ethers.formatEther(pendingReward), 'tokens');
            
            if (pendingReward == 0) {
                console.log('ℹ️ No rewards to claim');
                return {
                    success: false,
                    error: 'No rewards available to claim',
                    code: 'NO_REWARDS'
                };
            }
        } catch (err) {
            console.warn('⚠️ Could not calculate pending reward:', err.message);
        }
        
        console.log('⏳ Claiming rewards...');
        
        const tx = await StakingManager.claimReward(brandId, stakeId);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Parse events to get claimed amount
        let claimedAmount = null;
        
        for (const log of receipt.logs) {
            try {
                const parsedLog = StakingManager.interface.parseLog(log);
                if (parsedLog.name === 'RewardClaimed') {
                    claimedAmount = ethers.formatEther(parsedLog.args.amount);
                    console.log('🎁 Claimed Reward:', claimedAmount, 'tokens');
                    break;
                }
            } catch (err) {
                // Not a StakingManager event
            }
        }
        
        // Verify reward was claimed
        try {
            const newPendingReward = await StakingManager.calculateReward(brandId, await signer.getAddress(), stakeId);
            console.log('💰 Remaining Pending Reward:', ethers.formatEther(newPendingReward), 'tokens');
            
            console.log('🎉 ClaimReward completed successfully!');
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandId: brandId,
                stakeId: stakeId,
                claimedAmount: claimedAmount,
                remainingReward: ethers.formatEther(newPendingReward)
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                claimedAmount: claimedAmount,
                warning: 'Could not verify reward claim'
            };
        }
        
    } catch (error) {
        console.error('❌ ClaimReward failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('NoRewardsToClaim')) {
            return {
                success: false,
                error: 'No rewards available to claim',
                code: 'NO_REWARDS_TO_CLAIM'
            };
        }
        
        if (error.message.includes('StakeNotFound')) {
            return {
                success: false,
                error: 'Stake not found',
                code: 'STAKE_NOT_FOUND'
            };
        }
        
        if (error.message.includes('StakeNotActive')) {
            return {
                success: false,
                error: 'Stake is not active',
                code: 'STAKE_NOT_ACTIVE'
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
    const [brandId, stakeId, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !stakeId) {
        console.error('❌ Usage: node 07-claimReward.js <brandId> <stakeId> [userPrivateKey]');
        console.error('   Example: node 07-claimReward.js "brand-123" 1');
        process.exit(1);
    }
    
    runClaimReward(brandId, stakeId, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runClaimReward }; 
