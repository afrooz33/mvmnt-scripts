/**
 * 37-getStakingConfigValuesUint.js
 * StakingManager GetStakingConfigValuesUint Script
 * Purpose: Uint version of getStakingConfigValues (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetStakingConfigValuesUint(brandIdUint) {
    try {
        console.log('🚀 Starting GetStakingConfigValuesUint Script...');
        
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
        if (!brandIdUint) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 GetStakingConfigValuesUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing getStakingConfigValuesUint...');
        
        const result = await StakingManager.getStakingConfigValuesUint(brandIdUint);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 GetStakingConfigValuesUint completed successfully!');
        
        return {
                success: true,
                result: result,
                brandIdUint: brandIdUint,
                resultType: 'config values'
            };
        
    } catch (error) {
        console.error('❌ GetStakingConfigValuesUint failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandIdUint] = process.argv.slice(2);
    
    if (!brandIdUint) {
        console.error('❌ Usage: node 37-getStakingConfigValuesUint.js <brandIdUint>');
        console.error('   Example: node 37-getStakingConfigValuesUint.js "brand-123"');
        process.exit(1);
    }
    
    runGetStakingConfigValuesUint(brandIdUint)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetStakingConfigValuesUint };
