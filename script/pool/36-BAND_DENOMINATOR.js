/**
 * 36-BAND_DENOMINATOR.js
 * Pool BAND_DENOMINATOR Script
 * Purpose: Gets the band denominator
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runBAND_DENOMINATOR(userPrivateKey = null) {
    try {
        console.log('🚀 Starting BAND_DENOMINATOR Script...');
        
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

        
        console.log('🎯 BAND_DENOMINATOR Parameters:');

        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.js');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await Pool.BAND_DENOMINATOR();
        
        
        console.log('📊 Result:', result);
        
        console.log('🎉 BAND_DENOMINATOR completed successfully!');
        
        return {
            success: true,
            result: result,
            
            
            poolAddress: poolAddress
        };
        
    } catch (error) {
        console.error('❌ BAND_DENOMINATOR failed:', error.message);
        
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
    
    
    
    runBAND_DENOMINATOR(userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runBAND_DENOMINATOR };