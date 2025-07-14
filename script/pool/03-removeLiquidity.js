/**
 * 03-removeLiquidity.js
 * Pool RemoveLiquidity Script
 * Purpose: Removes liquidity from the pool by burning LP tokens
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runRemoveLiquidity(lpAmount, minTokenAmount, minStableAmount, userPrivateKey = null) {
    try {
        console.log('🚀 Starting RemoveLiquidity Script...');
        
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
        if (!lpAmount) {
            throw new Error('❌ LP amount is required');
        }
        
        // Convert inputs to proper formats
        const lpAmountWei = ethers.parseEther(lpAmount.toString());
        const minTokenAmountWei = minTokenAmount ? ethers.parseEther(minTokenAmount.toString()) : 0n;
        const minStableAmountWei = minStableAmount ? ethers.parseEther(minStableAmount.toString()) : 0n;
        
        console.log('🎯 Removal Parameters:');
        console.log('   - LP Amount:', ethers.formatEther(lpAmountWei), 'LP');
        console.log('   - Min Token Amount:', ethers.formatEther(minTokenAmountWei), 'tokens');
        console.log('   - Min Stable Amount:', ethers.formatEther(minStableAmountWei), 'stable');
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.js');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        // Check LP balance
        try {
            const lpBalance = await Pool.balanceOf(userAddress);
            console.log('💰 Current LP Balance:', ethers.formatEther(lpBalance));
            
            if (lpBalance < lpAmountWei) {
                throw new Error('❌ Insufficient LP token balance');
            }
        } catch (balanceError) {
            console.warn('⚠️ Could not check LP balance:', balanceError.message);
        }
        
        // Get current reserves for calculation
        try {
            const reserves = await Promise.all([
                Pool.tokenReserve(),
                Pool.stableReserve(),
                Pool.totalSupply()
            ]);
            
            console.log('📊 Pool Status:');
            console.log('   - Token Reserve:', ethers.formatEther(reserves[0]));
            console.log('   - Stable Reserve:', ethers.formatEther(reserves[1]));
            console.log('   - Total LP Supply:', ethers.formatEther(reserves[2]));
            
            // Calculate expected output
            const expectedTokens = (reserves[0] * lpAmountWei) / reserves[2];
            const expectedStable = (reserves[1] * lpAmountWei) / reserves[2];
            
            console.log('📈 Expected Output:');
            console.log('   - Expected Tokens:', ethers.formatEther(expectedTokens));
            console.log('   - Expected Stable:', ethers.formatEther(expectedStable));
            
        } catch (reserveError) {
            console.warn('⚠️ Could not check reserves:', reserveError.message);
        }
        
        console.log('⏳ Removing liquidity...');
        
        const tx = await Pool.removeLiquidity(lpAmountWei, minTokenAmountWei, minStableAmountWei);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Parse events to get removed amounts
        let removedTokens = null;
        let removedStable = null;
        
        for (const log of receipt.logs) {
            try {
                const parsedLog = Pool.interface.parseLog(log);
                if (parsedLog.name === 'LiquidityRemoved') {
                    removedTokens = parsedLog.args.tokenAmount;
                    removedStable = parsedLog.args.stableAmount;
                    console.log('🎉 Liquidity removed successfully!');
                    console.log('📊 Tokens Received:', ethers.formatEther(removedTokens));
                    console.log('📊 Stable Received:', ethers.formatEther(removedStable));
                    break;
                }
            } catch (err) {
                // Not a Pool event
            }
        }
        
        // Verify liquidity removal
        try {
            const newLpBalance = await Pool.balanceOf(userAddress);
            console.log('💰 New LP Balance:', ethers.formatEther(newLpBalance));
            
            const newReserves = await Promise.all([
                Pool.tokenReserve(),
                Pool.stableReserve()
            ]);
            
            console.log('📊 New Pool Reserves:');
            console.log('   - Token Reserve:', ethers.formatEther(newReserves[0]));
            console.log('   - Stable Reserve:', ethers.formatEther(newReserves[1]));
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                lpAmountBurned: ethers.formatEther(lpAmountWei),
                tokensReceived: removedTokens ? ethers.formatEther(removedTokens) : 'unknown',
                stableReceived: removedStable ? ethers.formatEther(removedStable) : 'unknown',
                poolAddress: poolAddress
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                warning: 'Could not verify liquidity removal'
            };
        }
        
    } catch (error) {
        console.error('❌ RemoveLiquidity failed:', error.message);
        
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
                error: 'Slippage too high, reduce minimum amounts',
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
    const [lpAmount, minTokenAmount, minStableAmount, userPrivateKey] = process.argv.slice(2);
    
    if (!lpAmount) {
        console.error('❌ Usage: node 03-removeLiquidity.js <lpAmount> [minTokenAmount] [minStableAmount] [userPrivateKey]');
        console.error('   Example: node 03-removeLiquidity.js 500 450 450');
        process.exit(1);
    }
    
    runRemoveLiquidity(lpAmount, minTokenAmount, minStableAmount, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runRemoveLiquidity }; 