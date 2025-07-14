/**
 * 26-updateAPY.js
 * StakingManager UpdateAPY Script
 * Purpose: Updates APY data for a brand
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runUpdateAPY(brandId) {
    try {
        console.log('🚀 Starting UpdateAPY Script...');
        
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
        
        console.log('🎯 UpdateAPY Parameters:');
        console.log('   - brandId:', brandId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing updateAPY...');
        
        const tx = await StakingManager.updateAPY(brandId);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 UpdateAPY completed successfully!');
        
        return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandId: brandId,
                operation: 'updateAPY'
            };
        
    } catch (error) {
        console.error('❌ UpdateAPY failed:', error.message);
        
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
        console.error('❌ Usage: node 26-updateAPY.js <brandId>');
        console.error('   Example: node 26-updateAPY.js "brand-123"');
        process.exit(1);
    }
    
    runUpdateAPY(brandId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runUpdateAPY };
