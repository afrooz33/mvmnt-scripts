/**
 * 29-transferFrom.js
 * Pool TransferFrom Script
 * Purpose: Transfers LP tokens from one account to another
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runTransferFrom(from, to, amount, userPrivateKey = null) {
    try {
        console.log('🚀 Starting TransferFrom Script...');
        
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
        if (!from) {
            throw new Error('❌ Sender address is required');
        }
        if (!to) {
            throw new Error('❌ Recipient address is required');
        }
        if (!amount) {
            throw new Error('❌ Amount to transfer is required');
        }
        
        // Convert inputs to proper formats
        if (!ethers.isAddress(from)) {
            throw new Error('❌ Invalid from address');
        }
        if (!ethers.isAddress(to)) {
            throw new Error('❌ Invalid to address');
        }
        const amountWei = ethers.parseEther(amount.toString());
        
        console.log('🎯 TransferFrom Parameters:');
        console.log('   - Sender address:', from);
        console.log('   - Recipient address:', to);
        console.log('   - Amount to transfer:', amount);
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.ts');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await Pool.transferFrom(from, to, amountWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 TransferFrom completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            0: 0,
            1: 1,
            2: 2,
            poolAddress: poolAddress
        };
        
    } catch (error) {
        console.error('❌ TransferFrom failed:', error.message);
        
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
    const [from, to, amount, userPrivateKey] = process.argv.slice(2);
    
    if (!from || !to || !amount) {
        console.error('❌ Usage: node 29-transferFrom.js "0x123..." "0x456..." 1000');
        process.exit(1);
    }
    
    runTransferFrom(from, to, amount, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runTransferFrom };