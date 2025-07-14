/**
 * 30-unstakeUint.js
 * StakingManager UnstakeUint Script
 * Purpose: Uint version of unstake
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runUnstakeUint(brandIdUint, stakeId) {
    try {
        console.log('🚀 Starting UnstakeUint Script...');
        
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
        if (!brandIdUint || !stakeId) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 UnstakeUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        console.log('   - stakeId:', stakeId);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.ts');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing unstakeUint...');
        
        const tx = await StakingManager.unstakeUint(brandIdUint, stakeId);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 UnstakeUint completed successfully!');
        
        return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandIdUint: brandIdUint,
                operation: 'unstakeUint'
            };
        
    } catch (error) {
        console.error('❌ UnstakeUint failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandIdUint, stakeId] = process.argv.slice(2);
    
    if (!brandIdUint) {
        console.error('❌ Usage: node 30-unstakeUint.js <brandIdUint> <stakeId>');
        console.error('   Example: node 30-unstakeUint.js "brand-123" "example-value"');
        process.exit(1);
    }
    
    runUnstakeUint(brandIdUint, stakeId)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runUnstakeUint };