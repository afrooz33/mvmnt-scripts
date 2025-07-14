/**
 * 25-balanceOf.js
 * Pool BalanceOf Script
 * Purpose: Gets the LP token balance of an account
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runBalanceOf(account, userPrivateKey = null) {
    try {
        console.log('🚀 Starting BalanceOf Script...');
        
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
        if (!account) {
            throw new Error('❌ Account address is required');
        }
        
        // Convert inputs to proper formats
        if (!ethers.isAddress(account)) {
            throw new Error('❌ Invalid account address');
        }
        
        console.log('🎯 BalanceOf Parameters:');
        console.log('   - Account address:', account);
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.js');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await Pool.balanceOf(account);
        
        
        console.log('📊 Result:', result.toString());
        
        console.log('🎉 BalanceOf completed successfully!');
        
        return {
            success: true,
            result: result,
            
            0: 0,
            poolAddress: poolAddress
        };
        
    } catch (error) {
        console.error('❌ BalanceOf failed:', error.message);
        
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
    const [account, userPrivateKey] = process.argv.slice(2);
    
    if (!account) {
        console.error('❌ Usage: node 25-balanceOf.js "0x123..."');
        process.exit(1);
    }
    
    runBalanceOf(account, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runBalanceOf };