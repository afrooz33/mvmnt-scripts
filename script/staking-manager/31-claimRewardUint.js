/**
 * 31-claimRewardUint.js
 * StakingManager ClaimRewardUint Script
 * Purpose: Uint version of claimReward
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runClaimRewardUint(brandIdUint, stakeId) {
    try {
        console.log('🚀 Starting ClaimRewardUint Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
        
        console.log('📝 Caller Address:', await signer.getAddress());
        
        // Get contract address
        const stakingManagerAddress = process.env.STAKING_MANAGER_CONTRACT_ADDRESS;
        if (!stakingManagerAddress) {
            throw new Error('❌ STAKING_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandIdUint || !stakeId) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 ClaimRewardUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        console.log('   - stakeId:', stakeId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing claimRewardUint...');
        
        const tx = await StakingManager.claimRewardUint(brandIdUint, stakeId);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 ClaimRewardUint completed successfully!');
        
        return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandIdUint: brandIdUint,
                operation: 'claimRewardUint'
            };
        
    } catch (error) {
        console.error('❌ ClaimRewardUint failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandIdUint, stakeId] = process.argv.slice(2);
    
    if (!brandIdUint) {
        console.error('❌ Usage: node 31-claimRewardUint.js <brandIdUint> <stakeId>');
        console.error('   Example: node 31-claimRewardUint.js "brand-123" "example-value"');
        process.exit(1);
    }
    
    runClaimRewardUint(brandIdUint, stakeId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runClaimRewardUint };
