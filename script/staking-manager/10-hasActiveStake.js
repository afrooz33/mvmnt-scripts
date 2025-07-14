/**
 * 10-hasActiveStake.js
 * StakingManager HasActiveStake Script
 * Purpose: Checks if user has active stakes (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runHasActiveStake(brandId, userAddress = null, isLPToken) {
    try {
        console.log('🚀 Starting HasActiveStake Script...');
        
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
        
        console.log('🎯 HasActiveStake Parameters:');
        console.log('   - brandId:', brandId);
        console.log('   - userAddress:', userAddress);
        console.log('   - isLPToken:', isLPToken);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.ts');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing hasActiveStake...');
        
        const result = await StakingManager.hasActiveStake(brandId, userAddress, isLPToken);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 HasActiveStake completed successfully!');
        
        return {
                success: true,
                result: result,
                brandId: brandId,
                resultType: 'boolean'
            };
        
    } catch (error) {
        console.error('❌ HasActiveStake failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandId, userAddress, isLPToken] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 10-hasActiveStake.js <brandId> <userAddress> <isLPToken>');
        console.error('   Example: node 10-hasActiveStake.js "brand-123" "example-value" "example-value"');
        process.exit(1);
    }
    
    runHasActiveStake(brandId, userAddress, isLPToken)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runHasActiveStake };