/**
 * 02-addLiquidity.js
 * Pool AddLiquidity Script
 * Purpose: Adds liquidity to the pool by providing brand tokens and stablecoins
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runAddLiquidity(tokenAmount, stableAmount, minLpAmount, senderAddress = null, userPrivateKey = null) {
    try {
        console.log('🚀 Starting AddLiquidity Script...');
        
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
        if (!tokenAmount || !stableAmount) {
            throw new Error('❌ Token amount and stable amount are required');
        }
        
        // Convert inputs to proper formats
        const tokenAmountWei = ethers.parseEther(tokenAmount.toString());
        const stableAmountWei = ethers.parseEther(stableAmount.toString());
        const minLpAmountWei = minLpAmount ? ethers.parseEther(minLpAmount.toString()) : 0n;
        const sender = senderAddress || userAddress;
        
        console.log('🎯 Liquidity Parameters:');
        console.log('   - Token Amount:', ethers.formatEther(tokenAmountWei), 'tokens');
        console.log('   - Stable Amount:', ethers.formatEther(stableAmountWei), 'stable');
        console.log('   - Min LP Amount:', ethers.formatEther(minLpAmountWei), 'LP');
        console.log('   - Sender:', sender);
        
        // Load contract
        const { PoolABI } = require('./abi/Pool.abi.js');
        const Pool = new ethers.Contract(poolAddress, PoolABI, signer);
        
        // Get token addresses
        const brandToken = await Pool.brandToken();
        const stablecoin = await Pool.stablecoin();
        
        console.log('💰 Token Addresses:');
        console.log('   - Brand Token:', brandToken);
        console.log('   - Stablecoin:', stablecoin);
        
        // Load token contracts for approval
        const { IERC20ABI } = require('./abi/IERC20.abi.ts');
        const BrandToken = new ethers.Contract(brandToken, IERC20ABI, signer);
        const StableCoin = new ethers.Contract(stablecoin, IERC20ABI, signer);
        
        // Check balances
        try {
            const brandBalance = await BrandToken.balanceOf(userAddress);
            const stableBalance = await StableCoin.balanceOf(userAddress);
            
            console.log('💳 User Balances:');
            console.log('   - Brand Token:', ethers.formatEther(brandBalance), 'tokens');
            console.log('   - Stablecoin:', ethers.formatEther(stableBalance), 'stable');
            
            if (brandBalance < tokenAmountWei) {
                throw new Error('❌ Insufficient brand token balance');
            }
            
            if (stableBalance < stableAmountWei) {
                throw new Error('❌ Insufficient stablecoin balance');
            }
        } catch (balanceError) {
            console.warn('⚠️ Could not check balances:', balanceError.message);
        }
        
        // Check and approve tokens
        try {
            const brandAllowance = await BrandToken.allowance(userAddress, poolAddress);
            const stableAllowance = await StableCoin.allowance(userAddress, poolAddress);
            
            console.log('🔐 Current Allowances:');
            console.log('   - Brand Token:', ethers.formatEther(brandAllowance), 'tokens');
            console.log('   - Stablecoin:', ethers.formatEther(stableAllowance), 'stable');
            
            // Approve brand token if needed
            if (brandAllowance < tokenAmountWei) {
                console.log('⏳ Approving brand tokens...');
                const approveTx = await BrandToken.approve(poolAddress, tokenAmountWei);
                await approveTx.wait();
                console.log('✅ Brand token approval completed');
            }
            
            // Approve stablecoin if needed
            if (stableAllowance < stableAmountWei) {
                console.log('⏳ Approving stablecoins...');
                const approveTx = await StableCoin.approve(poolAddress, stableAmountWei);
                await approveTx.wait();
                console.log('✅ Stablecoin approval completed');
            }
        } catch (approveError) {
            console.warn('⚠️ Could not check/approve tokens:', approveError.message);
        }
        
        console.log('⏳ Adding liquidity...');
        
        const tx = await Pool.addLiquidity(tokenAmountWei, stableAmountWei, minLpAmountWei, sender);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Parse events to get LP amount
        let lpAmount = null;
        for (const log of receipt.logs) {
            try {
                const parsedLog = Pool.interface.parseLog(log);
                if (parsedLog.name === 'LiquidityAdded') {
                    lpAmount = parsedLog.args.lpAmount;
                    console.log('🎉 Liquidity added successfully!');
                    console.log('📊 LP Tokens Received:', ethers.formatEther(lpAmount));
                    break;
                }
            } catch (err) {
                // Not a Pool event
            }
        }
        
        // Verify liquidity addition
        try {
            const lpBalance = await Pool.balanceOf(userAddress);
            console.log('💰 Total LP Balance:', ethers.formatEther(lpBalance));
            
            const reserves = await Promise.all([
                Pool.tokenReserve(),
                Pool.stableReserve()
            ]);
            
            console.log('📊 Pool Reserves:');
            console.log('   - Token Reserve:', ethers.formatEther(reserves[0]));
            console.log('   - Stable Reserve:', ethers.formatEther(reserves[1]));
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                lpTokensReceived: lpAmount ? ethers.formatEther(lpAmount) : 'unknown',
                tokenAmount: ethers.formatEther(tokenAmountWei),
                stableAmount: ethers.formatEther(stableAmountWei),
                poolAddress: poolAddress
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                warning: 'Could not verify liquidity addition'
            };
        }
        
    } catch (error) {
        console.error('❌ AddLiquidity failed:', error.message);
        
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
                error: 'Slippage too high, increase minLpAmount',
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
    const [tokenAmount, stableAmount, minLpAmount, senderAddress, userPrivateKey] = process.argv.slice(2);
    
    if (!tokenAmount || !stableAmount) {
        console.error('❌ Usage: node 02-addLiquidity.js <tokenAmount> <stableAmount> [minLpAmount] [senderAddress] [userPrivateKey]');
        console.error('   Example: node 02-addLiquidity.js 1000 1000 900');
        process.exit(1);
    }
    
    runAddLiquidity(tokenAmount, stableAmount, minLpAmount, senderAddress, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runAddLiquidity }; 