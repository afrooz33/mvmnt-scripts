/**
 * 35-calculateRewardUint.js
 * StakingManager CalculateRewardUint Script
 * Purpose: Uint version of calculateReward (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runCalculateRewardUint(brandIdUint, userAddress = null, stakeId) {
    try {
        console.log('🚀 Starting CalculateRewardUint Script...');
        
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
        if (!brandIdUint || !userAddress) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 CalculateRewardUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        console.log('   - userAddress:', userAddress);
        console.log('   - stakeId:', stakeId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing calculateRewardUint...');
        
        const result = await StakingManager.calculateRewardUint(brandIdUint, userAddress, stakeId);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 CalculateRewardUint completed successfully!');
        
        return {
                success: true,
                result: result,
                brandIdUint: brandIdUint,
                resultType: 'reward amount'
            };
        
    } catch (error) {
        console.error('❌ CalculateRewardUint failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandIdUint, userAddress, stakeId] = process.argv.slice(2);
    
    if (!brandIdUint) {
        console.error('❌ Usage: node 35-calculateRewardUint.js <brandIdUint> <userAddress> <stakeId>');
        console.error('   Example: node 35-calculateRewardUint.js "brand-123" "example-value" "example-value"');
        process.exit(1);
    }
    
    runCalculateRewardUint(brandIdUint, userAddress, stakeId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runCalculateRewardUint };
