/**
 * 23-brandIds.js
 * LPManager BrandIds Script
 * Purpose: Gets brand ID by index
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runBrandIds(index, userPrivateKey = null) {
    try {
        console.log('🚀 Starting BrandIds Script...');
        
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
        if (!index) {
            throw new Error('❌ Index is required');
        }
        
        // Convert inputs to proper formats
        const indexWei = ethers.parseEther(index.toString());
        
        console.log('🎯 BrandIds Parameters:');
        console.log('   - Index:', index);
        
        // Load contract
        const LPManagerABI = require('./abi/LPManager.abi.ts').default;
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await LPManager.brandIds(indexWei);
        
        
        console.log('📊 Result:', result);
        
        console.log('🎉 BrandIds completed successfully!');
        
        return {
            success: true,
            result: result,
            
            index: index,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ BrandIds failed:', error.message);
        
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
    const [index, userPrivateKey] = process.argv.slice(2);
    
    if (!index) {
        console.error('❌ Usage: node 23-brandIds.js 0');
        process.exit(1);
    }
    
    runBrandIds(index, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runBrandIds };