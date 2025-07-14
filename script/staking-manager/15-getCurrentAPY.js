/**
 * 15-getCurrentAPY.js
 * StakingManager GetCurrentAPY Script
 * Purpose: Gets current APY data (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetCurrentAPY(brandId) {
    try {
        console.log('🚀 Starting GetCurrentAPY Script...');
        
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
        if (!brandId) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 GetCurrentAPY Parameters:');
        console.log('   - brandId:', brandId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.ts');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing getCurrentAPY...');
        
        const result = await StakingManager.getCurrentAPY(brandId);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 GetCurrentAPY completed successfully!');
        
        return {
                success: true,
                result: result,
                brandId: brandId,
                resultType: 'APY data'
            };
        
    } catch (error) {
        console.error('❌ GetCurrentAPY failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandId] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 15-getCurrentAPY.js <brandId>');
        console.error('   Example: node 15-getCurrentAPY.js "brand-123"');
        process.exit(1);
    }
    
    runGetCurrentAPY(brandId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetCurrentAPY };