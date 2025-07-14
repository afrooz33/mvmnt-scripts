/**
 * 26-allowance.js
 * Pool Allowance Script
 * Purpose: Gets the allowance between owner and spender
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runAllowance(owner, spender, userPrivateKey = null) {
    try {
        console.log('🚀 Starting Allowance Script...');
        
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
        if (!owner) {
            throw new Error('❌ Owner address is required');
        }
        if (!spender) {
            throw new Error('❌ Spender address is required');
        }
        
        // Convert inputs to proper formats
        if (!ethers.isAddress(owner)) {
            throw new Error('❌ Invalid owner address');
        }
        if (!ethers.isAddress(spender)) {
            throw new Error('❌ Invalid spender address');
        }
        
        console.log('🎯 Allowance Parameters:');
        console.log('   - Owner address:', owner);
        console.log('   - Spender address:', spender);
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.js');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await Pool.allowance(owner, spender);
        
        
        console.log('📊 Result:', result.toString());
        
        console.log('🎉 Allowance completed successfully!');
        
        return {
            success: true,
            result: result,
            
            0: 0,
            1: 1,
            poolAddress: poolAddress
        };
        
    } catch (error) {
        console.error('❌ Allowance failed:', error.message);
        
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
    const [owner, spender, userPrivateKey] = process.argv.slice(2);
    
    if (!owner || !spender) {
        console.error('❌ Usage: node 26-allowance.js "0x123..." "0x456..."');
        process.exit(1);
    }
    
    runAllowance(owner, spender, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runAllowance };