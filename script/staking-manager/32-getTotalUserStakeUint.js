/**
 * 32-getTotalUserStakeUint.js
 * StakingManager GetTotalUserStakeUint Script
 * Purpose: Uint version of getTotalUserStake (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config();

async function runGetTotalUserStakeUint(brandIdUint, userAddress = null) {
    try {
        console.log('🚀 Starting GetTotalUserStakeUint Script...');
        
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
        
        console.log('🎯 GetTotalUserStakeUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        console.log('   - userAddress:', userAddress);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing getTotalUserStakeUint...');
        
        const result = await StakingManager.getTotalUserStakeUint(brandIdUint, userAddress);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 GetTotalUserStakeUint completed successfully!');
        
        return {
                success: true,
                result: result,
                brandIdUint: brandIdUint,
                resultType: 'total stake amount'
            };
        
    } catch (error) {
        console.error('❌ GetTotalUserStakeUint failed:', error.message);
        
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
        console.error('❌ Usage: node 32-getTotalUserStakeUint.js <brandIdUint> <userAddress>');
        console.error('   Example: node 32-getTotalUserStakeUint.js "brand-123" "example-value"');
        process.exit(1);
    }
    
    runGetTotalUserStakeUint(brandIdUint, userAddress)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetTotalUserStakeUint };
