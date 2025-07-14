/**
 * 02-createPool.js
 * LPManager CreatePool Script
 * Purpose: Creates a new liquidity pool for a brand
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runCreatePool(brandId, userPrivateKey = null) {
    try {
        console.log('🚀 Starting CreatePool Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Creator Address:', await signer.getAddress());
        
        // Get contract address
        const lpManagerAddress = process.env.LP_MANAGER_CONTRACT_ADDRESS;
        if (!lpManagerAddress) {
            throw new Error('❌ LP_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandId) {
            throw new Error('❌ Brand ID is required');
        }
        
        // Convert brandId to number
        const brandIdNum = parseInt(brandId);
        if (isNaN(brandIdNum)) {
            throw new Error('❌ Brand ID must be a valid number');
        }
        
        console.log('🎯 CreatePool Parameters:');
        console.log('   - Brand ID:', brandIdNum);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        // Check if pool already exists
        try {
            const existingPool = await LPManager.getPool(brandIdNum);
            if (existingPool.poolAddress !== '0x0000000000000000000000000000000000000000') {
                console.log('⚠️ Pool already exists for this brand:', existingPool.poolAddress);
                return {
                    success: false,
                    error: 'Pool already exists for this brand',
                    code: 'POOL_EXISTS',
                    existingPoolAddress: existingPool.poolAddress
                };
            }
        } catch (checkError) {
            // Pool doesn't exist, continue with creation
        }
        
        console.log('⏳ Creating new pool...');
        
        const tx = await LPManager.createPool(brandIdNum);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Get the new pool address from events or by querying
        let poolAddress = null;
        try {
            const poolInfo = await LPManager.getPool(brandIdNum);
            poolAddress = poolInfo.poolAddress;
            console.log('🏊 New Pool Address:', poolAddress);
        } catch (poolError) {
            console.warn('⚠️ Could not retrieve pool address:', poolError.message);
        }
        
        // Verify pool creation
        try {
            const allPools = await LPManager.getAllPools();
            console.log('📊 Total Pools:', allPools.length);
            
            console.log('🎉 Pool created successfully!');
            console.log('📊 Pool Information:');
            console.log('   - Brand ID:', brandIdNum);
            console.log('   - Pool Address:', poolAddress);
            console.log('   - Total Pools in System:', allPools.length);
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandId: brandIdNum,
                poolAddress: poolAddress,
                totalPools: allPools.length
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                poolAddress: poolAddress,
                warning: 'Could not verify pool creation'
            };
        }
        
    } catch (error) {
        console.error('❌ CreatePool failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('PoolAlreadyExists')) {
            return {
                success: false,
                error: 'Pool already exists for this brand',
                code: 'POOL_EXISTS'
            };
        }
        
        if (error.message.includes('InvalidBrandId')) {
            return {
                success: false,
                error: 'Invalid brand ID provided',
                code: 'INVALID_BRAND_ID'
            };
        }
        
        if (error.message.includes('Unauthorized')) {
            return {
                success: false,
                error: 'Unauthorized to create pool',
                code: 'UNAUTHORIZED'
            };
        }
        
        if (error.message.includes('paused')) {
            return {
                success: false,
                error: 'LPManager is currently paused',
                code: 'CONTRACT_PAUSED'
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
    const [brandId, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 02-createPool.js <brandId> [userPrivateKey]');
        console.error('   Example: node 02-createPool.js 123');
        process.exit(1);
    }
    
    runCreatePool(brandId, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runCreatePool }; 