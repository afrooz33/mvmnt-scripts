/**
 * 09-onFeeCollected.js
 * LPManager OnFeeCollected Script
 * Purpose: Handles fee collection from pools
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runOnFeeCollected(brandId, feeAmount, userPrivateKey = null) {
    try {
        console.log('🚀 Starting OnFeeCollected Script...');
        
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
        if (!feeAmount) {
            throw new Error('❌ Fee amount collected is required');
        }
        
        // Convert inputs to proper formats
        const brandIdWei = ethers.parseEther(brandId.toString());
        const feeAmountWei = ethers.parseEther(feeAmount.toString());
        
        console.log('🎯 OnFeeCollected Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Fee amount collected:', feeAmount);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await LPManager.onFeeCollected(brandIdWei, feeAmountWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 OnFeeCollected completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            brandId: brandId,
            feeAmount: feeAmount,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ OnFeeCollected failed:', error.message);
        
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
    const [brandId, feeAmount, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !feeAmount) {
        console.error('❌ Usage: node 09-onFeeCollected.js 123 100');
        process.exit(1);
    }
    
    runOnFeeCollected(brandId, feeAmount, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runOnFeeCollected };