/**
 * 01-initialize.js
 * LPManager Initialize Script
 * Purpose: Initializes LPManager contract with BTManager, stablecoin, pool implementation and DEX router
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runInitialize(btManager, stablecoin, poolImplementation, dexRouter) {
    try {
        console.log('🚀 Starting LPManager Initialize Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
        
        console.log('📝 Initializer Address:', await signer.getAddress());
        
        // Get contract address
        const lpManagerAddress = process.env.LP_MANAGER_CONTRACT_ADDRESS;
        if (!lpManagerAddress) {
            throw new Error('❌ LP_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!btManager || !stablecoin || !poolImplementation || !dexRouter) {
            throw new Error('❌ All parameters are required: btManager, stablecoin, poolImplementation, dexRouter');
        }
        
        // Validate addresses
        const addresses = { btManager, stablecoin, poolImplementation, dexRouter };
        for (const [name, address] of Object.entries(addresses)) {
            if (!ethers.isAddress(address)) {
                throw new Error(`❌ Invalid ${name} address: ${address}`);
            }
        }
        
        console.log('🎯 Initialization Parameters:');
        console.log('   - LPManager Address:', lpManagerAddress);
        console.log('   - BT Manager:', btManager);
        console.log('   - Stablecoin:', stablecoin);
        console.log('   - Pool Implementation:', poolImplementation);
        console.log('   - DEX Router:', dexRouter);
        
        // Load contract
        const { LPManagerABI } = require('./abi/LPManager.abi.js');
        const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
        
        console.log('⏳ Initializing LPManager contract...');
        
        const tx = await LPManager.initialize(btManager, stablecoin, poolImplementation, dexRouter);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Verify initialization
        try {
            const [
                contractBTManager,
                contractStablecoin,
                contractPoolImplementation,
                contractDexRouter,
                contractOwner
            ] = await Promise.all([
                LPManager.btManager(),
                LPManager.stablecoin(),
                LPManager.poolImplementation(),
                LPManager.dexRouter(),
                LPManager.owner()
            ]);
            
            console.log('✅ LPManager initialized successfully!');
            console.log('📊 Verification:');
            console.log('   - BT Manager:', contractBTManager);
            console.log('   - Stablecoin:', contractStablecoin);
            console.log('   - Pool Implementation:', contractPoolImplementation);
            console.log('   - DEX Router:', contractDexRouter);
            console.log('   - Owner:', contractOwner);
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                lpManagerAddress: lpManagerAddress,
                btManager: contractBTManager,
                stablecoin: contractStablecoin,
                poolImplementation: contractPoolImplementation,
                dexRouter: contractDexRouter,
                owner: contractOwner
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
                error: 'LPManager already initialized',
                code: 'ALREADY_INITIALIZED'
            };
        }
        
        if (error.message.includes('Ownable: caller is not the owner')) {
            return {
                success: false,
                error: 'Only owner can initialize',
                code: 'UNAUTHORIZED'
            };
        }
        
        if (error.message.includes('zero address')) {
            return {
                success: false,
                error: 'Invalid zero address provided',
                code: 'ZERO_ADDRESS'
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
    const [btManager, stablecoin, poolImplementation, dexRouter] = process.argv.slice(2);
    
    if (!btManager || !stablecoin || !poolImplementation || !dexRouter) {
        console.error('❌ Usage: node 01-initialize.js <btManager> <stablecoin> <poolImplementation> <dexRouter>');
        console.error('   Example: node 01-initialize.js "0x123..." "0x456..." "0x789..." "0xabc..."');
        process.exit(1);
    }
    
    runInitialize(btManager, stablecoin, poolImplementation, dexRouter)
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