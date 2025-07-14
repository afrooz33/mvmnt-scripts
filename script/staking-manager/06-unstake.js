/**
 * 06-unstake.js
 * StakingManager Unstake Script
 * Purpose: Unstakes tokens after lock period
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runUnstake(brandId, stakeId, userPrivateKey = null) {
    try {
        console.log('🚀 Starting Unstake Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Unstaker Address:', await signer.getAddress());
        
        // Get contract address
        const stakingManagerAddress = process.env.STAKING_MANAGER_CONTRACT_ADDRESS;
        if (!stakingManagerAddress) {
            throw new Error('❌ STAKING_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandId || !stakeId) {
            throw new Error('❌ Brand ID and stake ID are required');
        }
        
        console.log('🎯 Unstake Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Stake ID:', stakeId);
        
        // Load contracts
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        // Get user stakes to find the specific stake
        try {
            const userStakes = await StakingManager.getUserStakes(brandId, await signer.getAddress());
            console.log('📊 Total User Stakes:', userStakes.length);
            
            // Find the specific stake
            const targetStake = userStakes.find(stake => stake.stakeId.toString() === stakeId.toString());
            if (!targetStake) {
                throw new Error('❌ Stake not found for this user');
            }
            
            console.log('📋 Stake Details:');
            console.log('   - Amount:', ethers.formatEther(targetStake.amount), 'tokens');
            console.log('   - Lock Period:', targetStake.lockPeriod.toString(), 'seconds');
            console.log('   - Start Time:', new Date(targetStake.startTime * 1000).toISOString());
            console.log('   - Is LP Token:', targetStake.isLPToken);
            
            // Check if lock period is complete
            const currentTime = Math.floor(Date.now() / 1000);
            const unlockTime = parseInt(targetStake.startTime) + parseInt(targetStake.lockPeriod);
            
            if (currentTime < unlockTime) {
                const remainingTime = unlockTime - currentTime;
                console.log('⏰ Time until unlock:', remainingTime, 'seconds');
                console.log('🔒 Unlock date:', new Date(unlockTime * 1000).toISOString());
                throw new Error('❌ Stake is still locked');
            }
            
            console.log('✅ Stake is ready for unstaking');
            
        } catch (err) {
            if (err.message.includes('Stake is still locked')) {
                throw err;
            }
            console.warn('⚠️ Could not fetch stake details:', err.message);
        }
        
        console.log('⏳ Unstaking tokens...');
        
        const tx = await StakingManager.unstake(brandId, stakeId);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Parse events to get unstake details
        let unstakedAmount = null;
        let rewardAmount = null;
        
        for (const log of receipt.logs) {
            try {
                const parsedLog = StakingManager.interface.parseLog(log);
                if (parsedLog.name === 'Unstaked') {
                    unstakedAmount = ethers.formatEther(parsedLog.args.amount);
                    console.log('💰 Unstaked Amount:', unstakedAmount, 'tokens');
                }
                if (parsedLog.name === 'RewardClaimed') {
                    rewardAmount = ethers.formatEther(parsedLog.args.amount);
                    console.log('🎁 Reward Amount:', rewardAmount, 'tokens');
                }
            } catch (err) {
                // Not a StakingManager event
            }
        }
        
        // Verify unstake was successful
        try {
            const userStakes = await StakingManager.getUserStakes(brandId, await signer.getAddress());
            const remainingStake = userStakes.find(stake => stake.stakeId.toString() === stakeId.toString());
            
            if (!remainingStake) {
                console.log('✅ Stake successfully removed');
            } else {
                console.log('⚠️ Stake still exists - may be partially unstaked');
            }
            
            console.log('🎉 Unstake completed successfully!');
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandId: brandId,
                stakeId: stakeId,
                unstakedAmount: unstakedAmount,
                rewardAmount: rewardAmount
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                unstakedAmount: unstakedAmount,
                rewardAmount: rewardAmount,
                warning: 'Could not verify unstake completion'
            };
        }
        
    } catch (error) {
        console.error('❌ Unstake failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('StakeNotFound')) {
            return {
                success: false,
                error: 'Stake not found',
                code: 'STAKE_NOT_FOUND'
            };
        }
        
        if (error.message.includes('StakeLocked')) {
            return {
                success: false,
                error: 'Stake is still locked',
                code: 'STAKE_LOCKED'
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
        console.error('❌ Usage: node 06-unstake.js <brandId> <stakeId> [userPrivateKey]');
        console.error('   Example: node 06-unstake.js "brand-123" 1');
        process.exit(1);
    }
    
    runUnstake(brandId, stakeId, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runUnstake }; 
