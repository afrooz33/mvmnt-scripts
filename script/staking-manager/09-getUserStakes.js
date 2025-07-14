/**
 * 09-getUserStakes.js
 * StakingManager GetUserStakes Script
 * Purpose: Fetches all stakes for a user (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetUserStakes(brandId, userAddress = null) {
    try {
        console.log('🚀 Starting GetUserStakes Script...');
        
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
        
        console.log('🎯 GetUserStakes Parameters:');
        console.log('   - brandId:', brandId);
        console.log('   - userAddress:', userAddress);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing getUserStakes...');
        
        const result = await StakingManager.getUserStakes(brandId, userAddress);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 GetUserStakes completed successfully!');
        
        return {
                success: true,
                result: result,
                brandId: brandId,
                resultType: 'array of stakes'
            };
        
    } catch (error) {
        console.error('❌ GetUserStakes failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandId, userAddress] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 09-getUserStakes.js <brandId> <userAddress>');
        console.error('   Example: node 09-getUserStakes.js "brand-123" "example-value"');
        process.exit(1);
    }
    
    runGetUserStakes(brandId, userAddress)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetUserStakes };
