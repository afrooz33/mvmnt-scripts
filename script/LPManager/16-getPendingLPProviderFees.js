/**
 * 16-getPendingLPProviderFees.js
 * LPManager GetPendingLPProviderFees Script
 * Purpose: Gets pending LP provider fees for user
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetPendingLPProviderFees(brandId, user, userPrivateKey = null) {
    try {
        console.log('🚀 Starting GetPendingLPProviderFees Script...');
        
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
        if (!user) {
            throw new Error('❌ User address is required');
        }
        
        // Convert inputs to proper formats
        const brandIdWei = ethers.parseEther(brandId.toString());
        if (!ethers.isAddress(user)) {
            throw new Error('❌ Invalid user address');
        }
        
        console.log('🎯 GetPendingLPProviderFees Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - User address:', user);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Executing...');
        
        const result = await LPManager.getPendingLPProviderFees(brandIdWei, user);
        
        
        console.log('📊 Result:', result.toString());
        
        console.log('🎉 GetPendingLPProviderFees completed successfully!');
        
        return {
            success: true,
            result: result,
            
            brandId: brandId,
            user: user,
            lpManagerAddress: lpManagerAddress
        };
        
    } catch (error) {
        console.error('❌ GetPendingLPProviderFees failed:', error.message);
        
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
    const [brandId, user, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !user) {
        console.error('❌ Usage: node 16-getPendingLPProviderFees.js 123 "0x123..."');
        process.exit(1);
    }
    
    runGetPendingLPProviderFees(brandId, user, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetPendingLPProviderFees };