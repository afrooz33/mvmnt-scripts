/**
 * 04-addLiquidity.js
 * LPManager AddLiquidity Script
 * Purpose: Adds liquidity to a pool
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runAddLiquidity(brandId, tokenAmount, stableAmount, minLpAmount, userPrivateKey = null) {
    try {
        console.log('🚀 Starting AddLiquidity Script...');
        
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
        if (!tokenAmount) {
            throw new Error('❌ Token amount is required');
        }
        if (!stableAmount) {
            throw new Error('❌ Stable amount is required');
        }
        if (!minLpAmount) {
            throw new Error('❌ Minimum LP amount is required');
        }
        
        // Convert inputs to proper formats
        const brandIdWei = ethers.parseEther(brandId.toString());
        const tokenAmountWei = ethers.parseEther(tokenAmount.toString());
        const stableAmountWei = ethers.parseEther(stableAmount.toString());
        const minLpAmountWei = ethers.parseEther(minLpAmount.toString());
        
        console.log('🎯 AddLiquidity Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Token amount:', tokenAmount);
        console.log('   - Stable amount:', stableAmount);
        console.log('   - Minimum LP amount:', minLpAmount);
        
        // Load contract
        const LPManagerABI = require('./abi/LPManager.abi.ts').default;
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await LPManager.addLiquidity(brandIdWei, tokenAmountWei, stableAmountWei, minLpAmountWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 AddLiquidity completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            brandId: brandId,
            tokenAmount: tokenAmount,
            stableAmount: stableAmount,
            minLpAmount: minLpAmount,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ AddLiquidity failed:', error.message);
        
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
    const [brandId, tokenAmount, stableAmount, minLpAmount, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !tokenAmount || !stableAmount || !minLpAmount) {
        console.error('❌ Usage: node 04-addLiquidity.js 123 1000 1000 900');
        process.exit(1);
    }
    
    runAddLiquidity(brandId, tokenAmount, stableAmount, minLpAmount, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runAddLiquidity };