/**
 * 24-pools.js
 * LPManager Pools Script
 * Purpose: Gets pool address by brand ID
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runPools(brandId, userPrivateKey = null) {
    try {
        console.log('🚀 Starting Pools Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Caller Address:', await signer.getAddress());
        
        // Get contract address
        const lpManagerAddress = process.env.LP_MANAGER_CONTRACT_ADDRESS;
        if (!lpManagerAddress) {
            throw new Error('❌ LP_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandId) {
            throw new Error('❌ Brand ID is required');
        }
        
        // Convert inputs to proper formats
        const brandIdWei = ethers.parseEther(brandId.toString());
        
        console.log('🎯 Pools Parameters:');
        console.log('   - Brand ID:', brandId);
        
        // Load contract
        const LPManagerABI = require('./abi/LPManager.abi.ts').default;
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await LPManager.pools(brandIdWei);
        
        
        console.log('📊 Result:', result);
        
        console.log('🎉 Pools completed successfully!');
        
        return {
            success: true,
            result: result,
            
            brandId: brandId,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ Pools failed:', error.message);
        
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
                error: 'LPManager is paused',
                code: 'CONTRACT_PAUSED'
            };
        }
        
        if (error.message.includes('InvalidBrandId')) {
            return {
                success: false,
                error: 'Invalid brand ID',
                code: 'INVALID_BRAND_ID'
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
    const [brandId, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 24-pools.js 123');
        process.exit(1);
    }
    
    runPools(brandId, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runPools };