/**
 * 29-stakeLPTokenUint.js
 * StakingManager StakeLPTokenUint Script
 * Purpose: Uint version of stakeLPToken
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runStakeLPTokenUint(brandIdUint, amount, lockPeriod) {
    try {
        console.log('🚀 Starting StakeLPTokenUint Script...');
        
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
        if (!brandIdUint || !amount) {
            throw new Error('❌ Required parameters missing');
        }
        
        console.log('🎯 StakeLPTokenUint Parameters:');
        console.log('   - brandIdUint:', brandIdUint);
        console.log('   - amount:', amount);
        console.log('   - lockPeriod:', lockPeriod);
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Executing stakeLPTokenUint...');
        
        const tx = await StakingManager.stakeLPTokenUint(brandIdUint, amount, lockPeriod);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 StakeLPTokenUint completed successfully!');
        
        return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandIdUint: brandIdUint,
                operation: 'stakeLPTokenUint'
            };
        
    } catch (error) {
        console.error('❌ StakeLPTokenUint failed:', error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    const [brandIdUint, amount, lockPeriod] = process.argv.slice(2);
    
    if (!brandIdUint) {
        console.error('❌ Usage: node 29-stakeLPTokenUint.js <brandIdUint> <amount> <lockPeriod>');
        console.error('   Example: node 29-stakeLPTokenUint.js "brand-123" "example-value" 1000');
        process.exit(1);
    }
    
    runStakeLPTokenUint(brandIdUint, amount, lockPeriod)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runStakeLPTokenUint };
