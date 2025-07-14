/**
 * 05-removeLiquidity.js
 * LPManager RemoveLiquidity Script
 * Purpose: Removes liquidity from a pool
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runRemoveLiquidity(brandId, lpAmount, minTokenAmount, minStableAmount, userPrivateKey = null) {
    try {
        console.log('🚀 Starting RemoveLiquidity Script...');
        
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
        if (!lpAmount) {
            throw new Error('❌ LP amount to remove is required');
        }
        if (!minTokenAmount) {
            throw new Error('❌ Minimum token amount is required');
        }
        if (!minStableAmount) {
            throw new Error('❌ Minimum stable amount is required');
        }
        
        // Convert inputs to proper formats
        const brandIdWei = ethers.parseEther(brandId.toString());
        const lpAmountWei = ethers.parseEther(lpAmount.toString());
        const minTokenAmountWei = ethers.parseEther(minTokenAmount.toString());
        const minStableAmountWei = ethers.parseEther(minStableAmount.toString());
        
        console.log('🎯 RemoveLiquidity Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - LP amount to remove:', lpAmount);
        console.log('   - Minimum token amount:', minTokenAmount);
        console.log('   - Minimum stable amount:', minStableAmount);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await LPManager.removeLiquidity(brandIdWei, lpAmountWei, minTokenAmountWei, minStableAmountWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 RemoveLiquidity completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            brandId: brandId,
            lpAmount: lpAmount,
            minTokenAmount: minTokenAmount,
            minStableAmount: minStableAmount,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ RemoveLiquidity failed:', error.message);
        
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
    const [brandId, lpAmount, minTokenAmount, minStableAmount, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !lpAmount || !minTokenAmount || !minStableAmount) {
        console.error('❌ Usage: node 05-removeLiquidity.js 123 500 450 450');
        process.exit(1);
    }
    
    runRemoveLiquidity(brandId, lpAmount, minTokenAmount, minStableAmount, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runRemoveLiquidity };