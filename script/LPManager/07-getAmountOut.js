/**
 * 07-getAmountOut.js
 * LPManager GetAmountOut Script
 * Purpose: Calculates swap output amount
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetAmountOut(brandId, isBuyToken, amountIn, userPrivateKey = null) {
    try {
        console.log('🚀 Starting GetAmountOut Script...');
        
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
        if (!isBuyToken) {
            throw new Error('❌ Buy token (true) or sell token (false) is required');
        }
        if (!amountIn) {
            throw new Error('❌ Amount in is required');
        }
        
        // Convert inputs to proper formats
        const brandIdWei = ethers.parseEther(brandId.toString());
        const isBuyTokenBool = isBuyToken === 'true' || isBuyToken === true;
        const amountInWei = ethers.parseEther(amountIn.toString());
        
        console.log('🎯 GetAmountOut Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Buy token (true) or sell token (false):', isBuyToken);
        console.log('   - Amount in:', amountIn);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await LPManager.getAmountOut(brandIdWei, isBuyTokenBool, amountInWei);
        
        
        console.log('📊 Result:', result);
        
        console.log('🎉 GetAmountOut completed successfully!');
        
        return {
            success: true,
            result: result,
            
            brandId: brandId,
            isBuyToken: isBuyToken,
            amountIn: amountIn,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ GetAmountOut failed:', error.message);
        
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
    const [brandId, isBuyToken, amountIn, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !isBuyToken || !amountIn) {
        console.error('❌ Usage: node 07-getAmountOut.js 123 true 500');
        process.exit(1);
    }
    
    runGetAmountOut(brandId, isBuyToken, amountIn, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetAmountOut };