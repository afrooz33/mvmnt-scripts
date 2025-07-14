/**
 * 02-initialize.js
 * StakingManager Initialize Script
 * Purpose: Initializes StakingManager contract with BTManager address
*/

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});
const { StakingManagerABI } = require('./abi/StakingManager.abi.js');

async function runInitialize(btManagerAddress = null) {
    try {
        console.log('🚀 Starting StakingManager Initialize Script...');
        console.log(`Admin Private key is ${process.env.ADMIN_KEY}`);
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
        
        console.log('📝 Initializer Address:', await signer.getAddress());
        
        // Get contract address
        const stakingManagerAddress = process.env.STAKING_MANAGER_CONTRACT_ADDRESS;
        if (!stakingManagerAddress) {
            throw new Error('❌ STAKING_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Use provided BTManager address or from env
        const btManager = btManagerAddress || process.env.BRAND_MANAGER_ADDRESS;
        if (!btManager) {
            throw new Error('❌ BTManager address required');
        }
        
        // Validate address
        if (!ethers.isAddress(btManager)) {
            throw new Error('❌ Invalid BTManager address format');
        }
        
        console.log('🎯 Target StakingManager:', stakingManagerAddress);
        console.log('🎯 BTManager Address:', btManager);
        
        // Load StakingManager contract
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        // Check if already initialized (this will revert if already initialized)
        console.log('⏳ Initializing StakingManager...');
        
        const tx = await StakingManager.initialize(btManager);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Verify initialization
        try {
            const owner = await StakingManager.owner();
            console.log('👑 Contract Owner:', owner);
            
            console.log('🎉 Initialize completed successfully!');
            console.log('📋 Summary:');
            console.log('   - StakingManager Address:', stakingManagerAddress);
            console.log('   - BTManager Address:', btManager);
            console.log('   - Owner:', owner);
            console.log('   - Gas Used:', receipt.gasUsed.toString());
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                owner: owner
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                warning: 'Could not verify initialization'
            };
        }
        
    } catch (error) {
        console.error('❌ Initialize failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('already initialized')) {
            console.log('ℹ️ Contract is already initialized');
            return {
                success: false,
                error: 'Contract already initialized',
                code: 'ALREADY_INITIALIZED'
            };
        }
        
        if (error.message.includes('InvalidAddress')) {
            return {
                success: false,
                error: 'Invalid BTManager address provided',
                code: 'INVALID_ADDRESS'
            };
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    // Get BTManager address from command line args
    const btManagerAddress = process.argv[2];
    
    runInitialize(btManagerAddress)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runInitialize }; 
