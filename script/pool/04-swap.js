/**
 * 04-swap.js
 * Pool Swap Script
 * Purpose: Swaps tokens in the pool (buy tokens with stable or sell tokens for stable)
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runSwap(isBuyToken, amountIn, minAmountOut, userPrivateKey = null) {
    try {
        console.log('🚀 Starting Swap Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        const userAddress = await signer.getAddress();
        console.log('📝 User Address:', userAddress);
        
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
        const minAmountOutWei = minAmountOut ? ethers.parseEther(minAmountOut.toString()) : 0n;
        
        console.log('🎯 Swap Parameters:');
        console.log('   - Operation:', buyToken ? 'Buy Tokens (with stable)' : 'Sell Tokens (for stable)');
        console.log('   - Amount In:', ethers.formatEther(amountInWei), buyToken ? 'stable' : 'tokens');
        console.log('   - Min Amount Out:', ethers.formatEther(minAmountOutWei), buyToken ? 'tokens' : 'stable');
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.ts');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        // Get token addresses
        const brandToken = await Pool.brandToken();
        const stablecoin = await Pool.stablecoin();
        
        console.log('💰 Token Addresses:');
        console.log('   - Brand Token:', brandToken);
        console.log('   - Stablecoin:', stablecoin);
        
        // Get current price and calculate expected output
        try {
            const expectedOutput = await Pool.getAmountOut(buyToken, amountInWei);
            console.log('📈 Expected Output:', ethers.formatEther(expectedOutput), buyToken ? 'tokens' : 'stable');
            
            const currentPrice = await Pool.getCurrentPrice();
            console.log('💱 Current Price:', ethers.formatEther(currentPrice), 'stable per token');
            
        } catch (calcError) {
            console.warn('⚠️ Could not calculate expected output:', calcError.message);
        }
        
        // Load token contract for approval
        const { IERC20ABI } = require('./abi/IERC20.abi.ts');
        const inputTokenAddress = buyToken ? stablecoin : brandToken;
        const InputToken = new ethers.Contract(inputTokenAddress, IERC20ABI, signer);
        
        // Check balance and approve if needed
        try {
            const balance = await InputToken.balanceOf(userAddress);
            console.log('💳 Input Token Balance:', ethers.formatEther(balance), buyToken ? 'stable' : 'tokens');
            
            if (balance < amountInWei) {
                throw new Error('❌ Insufficient input token balance');
            }
            
            // Check allowance
            const allowance = await InputToken.allowance(userAddress, poolAddress);
            console.log('🔐 Current Allowance:', ethers.formatEther(allowance), buyToken ? 'stable' : 'tokens');
            
            if (allowance < amountInWei) {
                console.log('⏳ Approving tokens for swap...');
                const approveTx = await InputToken.approve(poolAddress, amountInWei);
                await approveTx.wait();
                console.log('✅ Token approval completed');
            }
        } catch (balanceError) {
            console.warn('⚠️ Could not check balance/allowance:', balanceError.message);
        }
        
        // Get pool reserves before swap
        try {
            const reserves = await Promise.all([
                Pool.tokenReserve(),
                Pool.stableReserve()
            ]);
            
            console.log('📊 Pool Reserves (Before):');
            console.log('   - Token Reserve:', ethers.formatEther(reserves[0]));
            console.log('   - Stable Reserve:', ethers.formatEther(reserves[1]));
            
        } catch (reserveError) {
            console.warn('⚠️ Could not check reserves:', reserveError.message);
        }
        
        console.log('⏳ Executing swap...');
        
        const tx = await Pool.swap(buyToken, amountInWei, minAmountOutWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Parse events to get swap results
        let actualAmountOut = null;
        
        for (const log of receipt.logs) {
            try {
                const parsedLog = Pool.interface.parseLog(log);
                if (parsedLog.name === 'Swap') {
                    actualAmountOut = parsedLog.args.amountOut;
                    console.log('🎉 Swap completed successfully!');
                    console.log('📊 Amount Out:', ethers.formatEther(actualAmountOut), buyToken ? 'tokens' : 'stable');
                    break;
                }
            } catch (err) {
                // Not a Pool event
            }
        }
        
        // Get new reserves and price
        try {
            const newReserves = await Promise.all([
                Pool.tokenReserve(),
                Pool.stableReserve()
            ]);
            
            console.log('📊 Pool Reserves (After):');
            console.log('   - Token Reserve:', ethers.formatEther(newReserves[0]));
            console.log('   - Stable Reserve:', ethers.formatEther(newReserves[1]));
            
            const newPrice = await Pool.getCurrentPrice();
            console.log('💱 New Price:', ethers.formatEther(newPrice), 'stable per token');
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                swapType: buyToken ? 'buy_tokens' : 'sell_tokens',
                amountIn: ethers.formatEther(amountInWei),
                amountOut: actualAmountOut ? ethers.formatEther(actualAmountOut) : 'unknown',
                newPrice: ethers.formatEther(newPrice),
                poolAddress: poolAddress
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                warning: 'Could not verify swap results'
            };
        }
        
    } catch (error) {
        console.error('❌ Swap failed:', error.message);
        
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
        
        if (error.message.includes('SlippageTooHigh')) {
            return {
                success: false,
                error: 'Slippage too high, reduce minAmountOut',
                code: 'SLIPPAGE_TOO_HIGH'
            };
        }
        
        if (error.message.includes('paused')) {
            return {
                success: false,
                error: 'Pool is currently paused',
                code: 'POOL_PAUSED'
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
    const [isBuyToken, amountIn, minAmountOut, userPrivateKey] = process.argv.slice(2);
    
    if (!isBuyToken || !amountIn) {
        console.error('❌ Usage: node 04-swap.js <isBuyToken> <amountIn> [minAmountOut] [userPrivateKey]');
        console.error('   isBuyToken: true (buy tokens with stable) or false (sell tokens for stable)');
        console.error('   Example: node 04-swap.js true 1000 950  # Buy tokens with 1000 stable');
        console.error('   Example: node 04-swap.js false 500 450  # Sell 500 tokens for stable');
        process.exit(1);
    }
    
    runSwap(isBuyToken, amountIn, minAmountOut, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runSwap }; 