/**
 * 35-updateImplementation.js
 * LPManager UpdateImplementation Script
 * Purpose: Updates pool implementation
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runUpdateImplementation(newImplementation, userPrivateKey = null) {
    try {
        console.log('🚀 Starting UpdateImplementation Script...');
        
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
        if (!newImplementation) {
            throw new Error('❌ New implementation address is required');
        }
        
        // Convert inputs to proper formats
        if (!ethers.isAddress(newImplementation)) {
            throw new Error('❌ Invalid newImplementation address');
        }
        
        console.log('🎯 UpdateImplementation Parameters:');
        console.log('   - New implementation address:', newImplementation);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await LPManager.updateImplementation(newImplementation);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 UpdateImplementation completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            newImplementation: newImplementation,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ UpdateImplementation failed:', error.message);
        
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
    const [newImplementation, userPrivateKey] = process.argv.slice(2);
    
    if (!newImplementation) {
        console.error('❌ Usage: node 35-updateImplementation.js "0x123..."');
        process.exit(1);
    }
    
    runUpdateImplementation(newImplementation, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runUpdateImplementation };