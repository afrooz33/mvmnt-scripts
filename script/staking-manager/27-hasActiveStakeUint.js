/**
 * 27-hasActiveStakeUint.js
 * StakingManager HasActiveStakeUint Script
 * Purpose: Uint version of hasActiveStake (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runHasActiveStakeUint(brandIdUint, userAddress = null, isLPToken) {
    try {
        console.log('🚀 Starting HasActiveStakeUint Script...');
        
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
        
        console.log('🎯 HasActiveStakeUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        console.log('   - userAddress:', userAddress);
        console.log('   - isLPToken:', isLPToken);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing hasActiveStakeUint...');
        
        const result = await StakingManager.hasActiveStakeUint(brandIdUint, userAddress, isLPToken);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 HasActiveStakeUint completed successfully!');
        
        return {
                success: true,
                result: result,
                brandIdUint: brandIdUint,
                resultType: 'boolean'
            };
        
    } catch (error) {
        console.error('❌ HasActiveStakeUint failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandIdUint, userAddress, isLPToken] = process.argv.slice(2);
    
    if (!brandIdUint) {
        console.error('❌ Usage: node 27-hasActiveStakeUint.js <brandIdUint> <userAddress> <isLPToken>');
        console.error('   Example: node 27-hasActiveStakeUint.js "brand-123" "example-value" "example-value"');
        process.exit(1);
    }
    
    runHasActiveStakeUint(brandIdUint, userAddress, isLPToken)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runHasActiveStakeUint };
