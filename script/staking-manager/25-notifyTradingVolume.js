/**
 * 25-notifyTradingVolume.js
 * StakingManager NotifyTradingVolume Script
 * Purpose: Notifies trading volume for APY calculation
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runNotifyTradingVolume(brandId, volume) {
    try {
        console.log('🚀 Starting NotifyTradingVolume Script...');
        
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
        if (!brandId || !volume) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 NotifyTradingVolume Parameters:');
        console.log('   - brandId:', brandId);
        console.log('   - volume:', volume);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing notifyTradingVolume...');
        
        const tx = await StakingManager.notifyTradingVolume(brandId, volume);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 NotifyTradingVolume completed successfully!');
        
        return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandId: brandId,
                operation: 'notifyTradingVolume'
            };
        
    } catch (error) {
        console.error('❌ NotifyTradingVolume failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandId, volume] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 25-notifyTradingVolume.js <brandId> <volume>');
        console.error('   Example: node 25-notifyTradingVolume.js "brand-123" "example-value"');
        process.exit(1);
    }
    
    runNotifyTradingVolume(brandId, volume)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runNotifyTradingVolume };
