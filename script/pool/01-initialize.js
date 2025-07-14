/**
 * 01-initialize.js
 * Pool Initialize Script
 * Purpose: Initializes Pool contract with brand token, stablecoin, brand ID, and manager
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runInitialize(brandToken, stablecoin, brandId, manager) {
    try {
        console.log('🚀 Starting Pool Initialize Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
        
        console.log('📝 Initializer Address:', await signer.getAddress());
        
        // Get contract address
        const poolAddress = process.env.POOL_CONTRACT_ADDRESS;
        if (!poolAddress) {
            throw new Error('❌ POOL_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandToken || !stablecoin || !brandId || !manager) {
            throw new Error('❌ All parameters are required: brandToken, stablecoin, brandId, manager');
        }
        
        // Validate addresses
        if (!ethers.isAddress(brandToken)) {
            throw new Error('❌ Invalid brand token address');
        }
        
        if (!ethers.isAddress(stablecoin)) {
            throw new Error('❌ Invalid stablecoin address');
        }
        
        if (!ethers.isAddress(manager)) {
            throw new Error('❌ Invalid manager address');
        }
        
        console.log('🎯 Initialization Parameters:');
        console.log('   - Pool Address:', poolAddress);
        console.log('   - Brand Token:', brandToken);
        console.log('   - Stablecoin:', stablecoin);
        console.log('   - Brand ID:', brandId);
        console.log('   - Manager:', manager);
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.js');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        console.log('⏳ Initializing Pool contract...');
        
        const tx = await Pool.initialize(brandToken, stablecoin, brandId, manager);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Verify initialization
        try {
            const poolBrandId = await Pool.brandId();
            const poolBrandToken = await Pool.brandToken();
            const poolStablecoin = await Pool.stablecoin();
            const poolManager = await Pool.manager();
            
            console.log('✅ Pool initialized successfully!');
            console.log('📊 Verification:');
            console.log('   - Brand ID:', poolBrandId.toString());
            console.log('   - Brand Token:', poolBrandToken);
            console.log('   - Stablecoin:', poolStablecoin);
            console.log('   - Manager:', poolManager);
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                poolAddress: poolAddress,
                brandId: poolBrandId.toString(),
                brandToken: poolBrandToken,
                stablecoin: poolStablecoin,
                manager: poolManager
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                warning: 'Could not verify initialization'
            };
        }
        
    } catch (error) {
        console.error('❌ Initialize failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('already initialized')) {
            return {
                success: false,
                error: 'Pool already initialized',
                code: 'ALREADY_INITIALIZED'
            };
        }
        
        if (error.message.includes('ZeroAddress')) {
            return {
                success: false,
                error: 'Invalid zero address provided',
                code: 'ZERO_ADDRESS'
            };
        }
        
        if (error.message.includes('Unauthorized')) {
            return {
                success: false,
                error: 'Only authorized user can initialize',
                code: 'UNAUTHORIZED'
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
    const [brandToken, stablecoin, brandId, manager] = process.argv.slice(2);
    
    if (!brandToken || !stablecoin || !brandId || !manager) {
        console.error('❌ Usage: node 01-initialize.js <brandToken> <stablecoin> <brandId> <manager>');
        console.error('   Example: node 01-initialize.js "0x123..." "0x456..." "123" "0x789..."');
        process.exit(1);
    }
    
    runInitialize(brandToken, stablecoin, brandId, manager)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runInitialize }; 