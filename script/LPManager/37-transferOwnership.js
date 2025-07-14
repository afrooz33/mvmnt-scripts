/**
 * 37-transferOwnership.js
 * LPManager TransferOwnership Script
 * Purpose: Transfers contract ownership
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runTransferOwnership(newOwner, userPrivateKey = null) {
    try {
        console.log('🚀 Starting TransferOwnership Script...');
        
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
        if (!newOwner) {
            throw new Error('❌ New owner address is required');
        }
        
        // Convert inputs to proper formats
        if (!ethers.isAddress(newOwner)) {
            throw new Error('❌ Invalid newOwner address');
        }
        
        console.log('🎯 TransferOwnership Parameters:');
        console.log('   - New owner address:', newOwner);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await LPManager.transferOwnership(newOwner);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 TransferOwnership completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            newOwner: newOwner,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ TransferOwnership failed:', error.message);
        
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
    const [newOwner, userPrivateKey] = process.argv.slice(2);
    
    if (!newOwner) {
        console.error('❌ Usage: node 37-transferOwnership.js "0x123..."');
        process.exit(1);
    }
    
    runTransferOwnership(newOwner, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runTransferOwnership };