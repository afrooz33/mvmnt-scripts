/**
 * 08-calculateReward.js
 * StakingManager CalculateReward Script
 * Purpose: Calculates pending reward for a stake (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runCalculateReward(brandId, userAddress = null, stakeId) {
    try {
        console.log('🚀 Starting CalculateReward Script...');
        
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
        if (!brandId || !userAddress) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 CalculateReward Parameters:');
        console.log('   - brandId:', brandId);
        console.log('   - userAddress:', userAddress);
        console.log('   - stakeId:', stakeId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing calculateReward...');
        
        const result = await StakingManager.calculateReward(brandId, userAddress, stakeId);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 CalculateReward completed successfully!');
        
        return {
                success: true,
                result: result,
                brandId: brandId,
                resultType: 'reward amount'
            };
        
    } catch (error) {
        console.error('❌ CalculateReward failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandId, userAddress, stakeId] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 08-calculateReward.js <brandId> <userAddress> <stakeId>');
        console.error('   Example: node 08-calculateReward.js "brand-123" "example-value" "example-value"');
        process.exit(1);
    }
    
    runCalculateReward(brandId, userAddress, stakeId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runCalculateReward };
