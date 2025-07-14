/**
 * 24-updateBTManager.js
 * StakingManager UpdateBTManager Script
 * Purpose: Updates BTManager contract address
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runUpdateBTManager(btManagerAddress = null) {
    try {
        console.log('🚀 Starting UpdateBTManager Script...');
        
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
        if (!btManagerAddress) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 UpdateBTManager Parameters:');
        console.log('   - btManagerAddress:', btManagerAddress);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.ts');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing updateBTManager...');
        
        const tx = await StakingManager.updateBTManager(btManagerAddress);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 UpdateBTManager completed successfully!');
        
        return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                btManagerAddress: btManagerAddress,
                operation: 'updateBTManager'
            };
        
    } catch (error) {
        console.error('❌ UpdateBTManager failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [btManagerAddress] = process.argv.slice(2);
    
    if (!btManagerAddress) {
        console.error('❌ Usage: node 24-updateBTManager.js <btManagerAddress>');
        console.error('   Example: node 24-updateBTManager.js "brand-123"');
        process.exit(1);
    }
    
    runUpdateBTManager(btManagerAddress)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runUpdateBTManager };