/**
 * 17-calculateTVL.js
 * StakingManager CalculateTVL Script
 * Purpose: Calculates Total Value Locked (view function)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runCalculateTVL(brandId) {
    try {
        console.log('🚀 Starting CalculateTVL Script...');
        
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
        
        console.log('🎯 CalculateTVL Parameters:');
        console.log('   - brandId:', brandId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing calculateTVL...');
        
        const result = await StakingManager.calculateTVL(brandId);
        
        console.log('📊 Result:', result);
        
        console.log('🎉 CalculateTVL completed successfully!');
        
        return {
                success: true,
                result: result,
                brandId: brandId,
                resultType: 'TVL amount'
            };
        
    } catch (error) {
        console.error('❌ CalculateTVL failed:', error.message);
        
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
        console.error('❌ Usage: node 17-calculateTVL.js <brandId>');
        console.error('   Example: node 17-calculateTVL.js "brand-123"');
        process.exit(1);
    }
    
    runCalculateTVL(brandId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runCalculateTVL };
