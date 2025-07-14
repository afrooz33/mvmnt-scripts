/**
 * 33-emergencyWithdraw.js
 * LPManager EmergencyWithdraw Script
 * Purpose: Emergency withdrawal of tokens
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runEmergencyWithdraw(token, to, amount, userPrivateKey = null) {
    try {
        console.log('🚀 Starting EmergencyWithdraw Script...');
        
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
        if (!token) {
            throw new Error('❌ Token address is required');
        }
        if (!to) {
            throw new Error('❌ Recipient address is required');
        }
        if (!amount) {
            throw new Error('❌ Amount to withdraw is required');
        }
        
        // Convert inputs to proper formats
        if (!ethers.isAddress(token)) {
            throw new Error('❌ Invalid token address');
        }
        if (!ethers.isAddress(to)) {
            throw new Error('❌ Invalid to address');
        }
        const amountWei = ethers.parseEther(amount.toString());
        
        console.log('🎯 EmergencyWithdraw Parameters:');
        console.log('   - Token address:', token);
        console.log('   - Recipient address:', to);
        console.log('   - Amount to withdraw:', amount);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Sending transaction...');
        
        const tx = await LPManager.emergencyWithdraw(token, to, amountWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        
        
        console.log('🎉 EmergencyWithdraw completed successfully!');
        
        return {
            success: true,
            transactionHash: tx.hash,
            gasUsed: receipt.gasUsed.toString(),
            token: token,
            to: to,
            amount: amount,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ EmergencyWithdraw failed:', error.message);
        
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
    const [token, to, amount, userPrivateKey] = process.argv.slice(2);
    
    if (!token || !to || !amount) {
        console.error('❌ Usage: node 33-emergencyWithdraw.js "0x123..." "0x456..." 1000');
        process.exit(1);
    }
    
    runEmergencyWithdraw(token, to, amount, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runEmergencyWithdraw };