/**
 * 32-PRECISION.js
 * Pool PRECISION Script
 * Purpose: Gets the precision constant
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runPRECISION(userPrivateKey = null) {
    try {
        console.log('🚀 Starting PRECISION Script...');
        
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

        
        // Convert inputs to proper formats

        
        console.log('🎯 PRECISION Parameters:');

        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.ts');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await Pool.PRECISION();
        
        
        console.log('📊 Result:', result);
        
        console.log('🎉 PRECISION completed successfully!');
        
        return {
            success: true,
            result: result,
            
            
            poolAddress: poolAddress
        };
        
    } catch (error) {
        console.error('❌ PRECISION failed:', error.message);
        
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
    const [userPrivateKey] = process.argv.slice(2);
    
    
    
    runPRECISION(userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runPRECISION };