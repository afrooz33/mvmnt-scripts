/**
 * 19-calculateLPTokenAPY.js
 * StakingManager CalculateLPTokenAPY Script
 * Purpose: Calculates LP token APY (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runCalculateLPTokenAPY(brandId) {
    try {
        console.log('🚀 Starting CalculateLPTokenAPY Script...');
        
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
        
        console.log('🎯 CalculateLPTokenAPY Parameters:');
        console.log('   - brandId:', brandId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing calculateLPTokenAPY...');
        
        const result = await StakingManager.calculateLPTokenAPY(brandId);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 CalculateLPTokenAPY completed successfully!');
        
        return {
                success: true,
                result: result,
                brandId: brandId,
                resultType: 'LP token APY'
            };
        
    } catch (error) {
        console.error('❌ CalculateLPTokenAPY failed:', error.message);
        
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
        console.error('❌ Usage: node 19-calculateLPTokenAPY.js <brandId>');
        console.error('   Example: node 19-calculateLPTokenAPY.js "brand-123"');
        process.exit(1);
    }
    
    runCalculateLPTokenAPY(brandId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runCalculateLPTokenAPY };
