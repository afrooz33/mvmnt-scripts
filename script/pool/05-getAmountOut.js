/**
 * 05-getAmountOut.js
 * Pool GetAmountOut Script
 * Purpose: Calculates the output amount for a swap without executing it
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runGetAmountOut(isBuyToken, amountIn, userPrivateKey = null) {
    try {
        console.log('🚀 Starting GetAmountOut Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Caller Address:', await signer.getAddress());
        
        // Get contract address
        const poolAddress = process.env.POOL_CONTRACT_ADDRESS;
        if (!poolAddress) {
            throw new Error('❌ POOL_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (typeof isBuyToken !== 'boolean' && isBuyToken !== 'true' && isBuyToken !== 'false') {
            throw new Error('❌ isBuyToken must be true or false');
        }
        
        if (!amountIn) {
            throw new Error('❌ Amount in is required');
        }
        
        // Convert inputs to proper formats
        const buyToken = isBuyToken === true || isBuyToken === 'true';
        const amountInWei = ethers.parseEther(amountIn.toString());
        
        console.log('🎯 GetAmountOut Parameters:');
        console.log('   - Operation:', buyToken ? 'Buy Tokens (with stable)' : 'Sell Tokens (for stable)');
        console.log('   - Amount In:', ethers.formatEther(amountInWei), buyToken ? 'stable' : 'tokens');
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.ts');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        // Get token addresses
        const brandToken = await Pool.brandToken();
        const stablecoin = await Pool.stablecoin();
        
        console.log('💰 Token Addresses:');
        console.log('   - Brand Token:', brandToken);
        console.log('   - Stablecoin:', stablecoin);
        
        // Get current pool state
        const [currentPrice, reserves] = await Promise.all([
            Pool.getCurrentPrice(),
            Promise.all([
                Pool.tokenReserve(),
                Pool.stableReserve()
            ])
        ]);
        
        console.log('📊 Current Pool State:');
        console.log('   - Current Price:', ethers.formatEther(currentPrice), 'stable per token');
        console.log('   - Token Reserve:', ethers.formatEther(reserves[0]), 'tokens');
        console.log('   - Stable Reserve:', ethers.formatEther(reserves[1]), 'stable');
        
        console.log('⏳ Calculating amount out...');
        
        const amountOut = await Pool.getAmountOut(buyToken, amountInWei);
        
        console.log('📊 Calculation Result:');
        console.log('   - Amount Out:', ethers.formatEther(amountOut), buyToken ? 'tokens' : 'stable');
        
        // Calculate price impact
        const priceImpact = await calculatePriceImpact(Pool, buyToken, amountInWei, amountOut);
        console.log('   - Price Impact:', priceImpact, '%');
        
        // Calculate effective price
        const effectivePrice = buyToken ? 
            (amountInWei * ethers.parseEther('1')) / amountOut :
            (amountOut * ethers.parseEther('1')) / amountInWei;
        
        console.log('   - Effective Price:', ethers.formatEther(effectivePrice), 'stable per token');
        
        // Get price bounds
        try {
            const priceBounds = await Pool.getPriceBounds();
            console.log('📈 Price Bounds:');
            console.log('   - Lower Bound:', ethers.formatEther(priceBounds.lowerBound), 'stable per token');
            console.log('   - Upper Bound:', ethers.formatEther(priceBounds.upperBound), 'stable per token');
            
            // Check if swap would violate bounds
            const newPrice = buyToken ? 
                (reserves[1] + amountInWei) * ethers.parseEther('1') / (reserves[0] - amountOut) :
                (reserves[1] - amountOut) * ethers.parseEther('1') / (reserves[0] + amountInWei);
            
            console.log('   - New Price After Swap:', ethers.formatEther(newPrice), 'stable per token');
            
            if (newPrice < priceBounds.lowerBound || newPrice > priceBounds.upperBound) {
                console.log('⚠️ Warning: Swap would violate price bounds!');
            }
            
        } catch (boundsError) {
            console.warn('⚠️ Could not check price bounds:', boundsError.message);
        }
        
        console.log('🎉 GetAmountOut completed successfully!');
        
        return {
            success: true,
            swapType: buyToken ? 'buy_tokens' : 'sell_tokens',
            amountIn: ethers.formatEther(amountInWei),
            amountOut: ethers.formatEther(amountOut),
            currentPrice: ethers.formatEther(currentPrice),
            effectivePrice: ethers.formatEther(effectivePrice),
            priceImpact: priceImpact,
            poolAddress: poolAddress
        };
        
    } catch (error) {
        console.error('❌ GetAmountOut failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('InsufficientLiquidity')) {
            return {
                success: false,
                error: 'Insufficient liquidity in pool',
                code: 'INSUFFICIENT_LIQUIDITY'
            };
        }
        
        if (error.message.includes('InvalidAmount')) {
            return {
                success: false,
                error: 'Invalid amount provided',
                code: 'INVALID_AMOUNT'
            };
        }
        
        if (error.message.includes('ZeroAmount')) {
            return {
                success: false,
                error: 'Amount cannot be zero',
                code: 'ZERO_AMOUNT'
            };
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Helper function to calculate price impact
async function calculatePriceImpact(Pool, buyToken, amountIn, amountOut) {
    try {
        const [currentPrice, reserves] = await Promise.all([
            Pool.getCurrentPrice(),
            Promise.all([
                Pool.tokenReserve(),
                Pool.stableReserve()
            ])
        ]);
        
        // Calculate new price after swap
        const newPrice = buyToken ? 
            (reserves[1] + amountIn) * ethers.parseEther('1') / (reserves[0] - amountOut) :
            (reserves[1] - amountOut) * ethers.parseEther('1') / (reserves[0] + amountIn);
        
        // Calculate price impact percentage
        const priceDiff = buyToken ? 
            newPrice - currentPrice :
            currentPrice - newPrice;
        
        const priceImpact = (priceDiff * 10000n) / currentPrice;
        
        return (Number(priceImpact) / 100).toFixed(2);
        
    } catch (error) {
        return 'unknown';
    }
}

// Run if called directly
if (require.main === module) {
    const [isBuyToken, amountIn, userPrivateKey] = process.argv.slice(2);
    
    if (!isBuyToken || !amountIn) {
        console.error('❌ Usage: node 05-getAmountOut.js <isBuyToken> <amountIn> [userPrivateKey]');
        console.error('   isBuyToken: true (buy tokens with stable) or false (sell tokens for stable)');
        console.error('   Example: node 05-getAmountOut.js true 1000  # Calculate tokens for 1000 stable');
        console.error('   Example: node 05-getAmountOut.js false 500  # Calculate stable for 500 tokens');
        process.exit(1);
    }
    
    runGetAmountOut(isBuyToken, amountIn, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runGetAmountOut }; 