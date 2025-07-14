/**
 * 06-swap.js
 * LPManager Swap Script
 * Purpose: Swaps tokens in a pool
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runSwap(brandId, isBuyToken, amountIn, minAmountOut, userPrivateKey = null) {
    try {
        console.log('🚀 Starting Swap Script...');
        
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
        if (!minAmountOut) {
            throw new Error('❌ Minimum amount out is required');
        }
        
        // Convert inputs to proper formats
        const brandIdWei = ethers.parseEther(brandId.toString());
        const isBuyTokenBool = isBuyToken === 'true' || isBuyToken === true;
        const amountInWei = ethers.parseEther(amountIn.toString());
        const minAmountOutWei = ethers.parseEther(minAmountOut.toString());
        
        console.log('🎯 Swap Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Buy token (true) or sell token (false):', isBuyToken);
        console.log('   - Amount in:', amountIn);
        console.log('   - Minimum amount out:', minAmountOut);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await LPManager.swap(brandIdWei, isBuyTokenBool, amountInWei, minAmountOutWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 Swap completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            brandId: brandId,
            isBuyToken: isBuyToken,
            amountIn: amountIn,
            minAmountOut: minAmountOut,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ Swap failed:', error.message);
        
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
    const [brandId, isBuyToken, amountIn, minAmountOut, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !isBuyToken || !amountIn || !minAmountOut) {
        console.error('❌ Usage: node 06-swap.js 123 true 500 450');
        process.exit(1);
    }
    
    runSwap(brandId, isBuyToken, amountIn, minAmountOut, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runSwap };