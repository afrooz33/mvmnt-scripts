/**
 * 09-setFee.js
 * Pool SetFee Script
 * Purpose: Sets the trading fee for the pool
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runSetFee(newFee, userPrivateKey = null) {
    try {
        console.log('🚀 Starting SetFee Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Caller Address:', await signer.getAddress());
        
        // Get contract address
        const poolAddress = process.env.POOL_CONTRACT_ADDRESS;
        if (!poolAddress) {
            throw new Error('❌ POOL_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!newFee) {
            throw new Error('❌ New fee amount is required');
        }
        
        // Convert inputs to proper formats
        const newFeeWei = ethers.parseEther(newFee.toString());
        
        console.log('🎯 SetFee Parameters:');
        console.log('   - New fee amount:', newFee);
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.js');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await Pool.setFee(newFeeWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 SetFee completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            0: 0,
            poolAddress: poolAddress
        };
        
    } catch (error) {
        console.error('❌ SetFee failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('Unauthorized')) {
            return {
                success: false,
                error: 'Unauthorized access',
                code: 'UNAUTHORIZED'
            };
        }
        
        if (error.message.includes('paused')) {
            return {
                success: false,
                error: 'Pool is paused',
                code: 'POOL_PAUSED'
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
    const [newFee, userPrivateKey] = process.argv.slice(2);
    
    if (!newFee) {
        console.error('❌ Usage: node 09-setFee.js 30  # 0.3% fee');
        process.exit(1);
    }
    
    runSetFee(newFee, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runSetFee };