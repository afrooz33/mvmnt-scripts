/**
 * 13-getTotalUserStake.js
 * StakingManager GetTotalUserStake Script
 * Purpose: Gets total stake amount for a user (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetTotalUserStake(brandId, userAddress = null) {
    try {
        console.log('🚀 Starting GetTotalUserStake Script...');
        
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
        
        console.log('🎯 GetTotalUserStake Parameters:');
        console.log('   - brandId:', brandId);
        console.log('   - userAddress:', userAddress);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing getTotalUserStake...');
        
        const result = await StakingManager.getTotalUserStake(brandId, userAddress);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 GetTotalUserStake completed successfully!');
        
        return {
                success: true,
                result: result,
                brandId: brandId,
                resultType: 'user total stake'
            };
        
    } catch (error) {
        console.error('❌ GetTotalUserStake failed:', error.message);
        
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
        console.error('❌ Usage: node 13-getTotalUserStake.js <brandId> <userAddress>');
        console.error('   Example: node 13-getTotalUserStake.js "brand-123" "example-value"');
        process.exit(1);
    }
    
    runGetTotalUserStake(brandId, userAddress)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetTotalUserStake };
