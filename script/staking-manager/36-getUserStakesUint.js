/**
 * 36-getUserStakesUint.js
 * StakingManager GetUserStakesUint Script
 * Purpose: Uint version of getUserStakes (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetUserStakesUint(brandIdUint, userAddress = null) {
    try {
        console.log('🚀 Starting GetUserStakesUint Script...');
        
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
        
        console.log('🎯 GetUserStakesUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        console.log('   - userAddress:', userAddress);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing getUserStakesUint...');
        
        const result = await StakingManager.getUserStakesUint(brandIdUint, userAddress);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 GetUserStakesUint completed successfully!');
        
        return {
                success: true,
                result: result,
                brandIdUint: brandIdUint,
                resultType: 'array of stakes'
            };
        
    } catch (error) {
        console.error('❌ GetUserStakesUint failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandIdUint, userAddress] = process.argv.slice(2);
    
    if (!brandIdUint) {
        console.error('❌ Usage: node 36-getUserStakesUint.js <brandIdUint> <userAddress>');
        console.error('   Example: node 36-getUserStakesUint.js "brand-123" "example-value"');
        process.exit(1);
    }
    
    runGetUserStakesUint(brandIdUint, userAddress)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetUserStakesUint };
