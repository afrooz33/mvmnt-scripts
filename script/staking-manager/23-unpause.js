/**
 * 23-unpause.js
 * StakingManager Unpause Script
 * Purpose: Resumes entire contract
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runUnpause() {
    try {
        console.log('🚀 Starting Unpause Script...');
        
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
        // No parameter validation needed
        
        console.log('🎯 Unpause Parameters:');
        
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing unpause...');
        
        const tx = await StakingManager.unpause();
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 Unpause completed successfully!');
        
        return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                
                operation: 'unpause'
            };
        
    } catch (error) {
        console.error('❌ Unpause failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [] = process.argv.slice(2);
    
    
    
    runUnpause()
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runUnpause };
