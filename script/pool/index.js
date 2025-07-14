/**
 * index.js
 * Pool Contract Scripts Index
 * Purpose: Main entry point for Pool contract interactions
 */

// Core Functions
const { runInitialize } = require('./01-initialize');
const { runAddLiquidity } = require('./02-addLiquidity');
const { runRemoveLiquidity } = require('./03-removeLiquidity');
const { runSwap } = require('./04-swap');
const { runGetAmountOut } = require('./05-getAmountOut');

// Management Functions
const { runUpdateReferencePrice } = require('./06-updateReferencePrice');
const { runPause } = require('./07-pause');
const { runUnpause } = require('./08-unpause');
const { runSetFee } = require('./09-setFee');
const { runEmergencyWithdraw } = require('./10-emergencyWithdraw');

// Information Functions
const { runGetCurrentPrice } = require('./11-getCurrentPrice');
const { runGetPriceBounds } = require('./12-getPriceBounds');
const { runGetPriceInfo } = require('./13-getPriceInfo');
const { runPaused } = require('./14-paused');
const { runBrandId } = require('./15-brandId');
const { runBrandToken } = require('./16-brandToken');
const { runStablecoin } = require('./17-stablecoin');
const { runTokenReserve } = require('./18-tokenReserve');
const { runStableReserve } = require('./19-stableReserve');
const { runManager } = require('./20-manager');
const { runFee } = require('./21-fee');
const { runReferencePrice } = require('./22-referencePrice');
const { runLastReferenceUpdate } = require('./23-lastReferenceUpdate');

// ERC20 Functions
const { runTotalSupply } = require('./24-totalSupply');
const { runBalanceOf } = require('./25-balanceOf');
const { runAllowance } = require('./26-allowance');
const { runApprove } = require('./27-approve');
const { runTransfer } = require('./28-transfer');
const { runTransferFrom } = require('./29-transferFrom');

// Constants
const { runDEFAULT_FEE } = require('./30-DEFAULT_FEE');
const { runFEE_DENOMINATOR } = require('./31-FEE_DENOMINATOR');
const { runPRECISION } = require('./32-PRECISION');
const { runREFERENCE_UPDATE_INTERVAL } = require('./33-REFERENCE_UPDATE_INTERVAL');
const { runUPPER_BAND_MULTIPLIER } = require('./34-UPPER_BAND_MULTIPLIER');
const { runLOWER_BAND_MULTIPLIER } = require('./35-LOWER_BAND_MULTIPLIER');
const { runBAND_DENOMINATOR } = require('./36-BAND_DENOMINATOR');

// Pool Manager Class
class PoolManager {
    constructor() {
        this.functions = {
            // Core Functions
            initialize: runInitialize,
            addLiquidity: runAddLiquidity,
            removeLiquidity: runRemoveLiquidity,
            swap: runSwap,
            getAmountOut: runGetAmountOut,
            
            // Management Functions
            updateReferencePrice: runUpdateReferencePrice,
            pause: runPause,
            unpause: runUnpause,
            setFee: runSetFee,
            emergencyWithdraw: runEmergencyWithdraw,
            
            // Information Functions
            getCurrentPrice: runGetCurrentPrice,
            getPriceBounds: runGetPriceBounds,
            getPriceInfo: runGetPriceInfo,
            paused: runPaused,
            brandId: runBrandId,
            brandToken: runBrandToken,
            stablecoin: runStablecoin,
            tokenReserve: runTokenReserve,
            stableReserve: runStableReserve,
            manager: runManager,
            fee: runFee,
            referencePrice: runReferencePrice,
            lastReferenceUpdate: runLastReferenceUpdate,
            
            // ERC20 Functions
            totalSupply: runTotalSupply,
            balanceOf: runBalanceOf,
            allowance: runAllowance,
            approve: runApprove,
            transfer: runTransfer,
            transferFrom: runTransferFrom,
            
            // Constants
            DEFAULT_FEE: runDEFAULT_FEE,
            FEE_DENOMINATOR: runFEE_DENOMINATOR,
            PRECISION: runPRECISION,
            REFERENCE_UPDATE_INTERVAL: runREFERENCE_UPDATE_INTERVAL,
            UPPER_BAND_MULTIPLIER: runUPPER_BAND_MULTIPLIER,
            LOWER_BAND_MULTIPLIER: runLOWER_BAND_MULTIPLIER,
            BAND_DENOMINATOR: runBAND_DENOMINATOR
        };
    }
    
    // Execute any pool function
    async execute(functionName, ...args) {
        const func = this.functions[functionName];
        if (!func) {
            throw new Error(`Function ${functionName} not found`);
        }
        return await func(...args);
    }
    
    // Get pool overview
    async getPoolOverview() {
        try {
            const [
                brandId,
                brandToken,
                stablecoin,
                tokenReserve,
                stableReserve,
                currentPrice,
                fee,
                paused,
                totalSupply
            ] = await Promise.all([
                this.execute('brandId'),
                this.execute('brandToken'),
                this.execute('stablecoin'),
                this.execute('tokenReserve'),
                this.execute('stableReserve'),
                this.execute('getCurrentPrice'),
                this.execute('fee'),
                this.execute('paused'),
                this.execute('totalSupply')
            ]);
            
            return {
                brandId: brandId.result,
                brandToken: brandToken.result,
                stablecoin: stablecoin.result,
                tokenReserve: tokenReserve.result,
                stableReserve: stableReserve.result,
                currentPrice: currentPrice.result,
                fee: fee.result,
                paused: paused.result,
                totalSupply: totalSupply.result
            };
        } catch (error) {
            throw new Error(`Failed to get pool overview: ${error.message}`);
        }
    }
    
    // Get user LP info
    async getUserLPInfo(userAddress) {
        try {
            const [balance, totalSupply, tokenReserve, stableReserve] = await Promise.all([
                this.execute('balanceOf', userAddress),
                this.execute('totalSupply'),
                this.execute('tokenReserve'),
                this.execute('stableReserve')
            ]);
            
            // Calculate user's share
            const userShare = balance.result / totalSupply.result;
            const userTokens = tokenReserve.result * userShare;
            const userStable = stableReserve.result * userShare;
            
            return {
                lpBalance: balance.result,
                sharePercentage: (userShare * 100).toFixed(2),
                underlyingTokens: userTokens,
                underlyingStable: userStable
            };
        } catch (error) {
            throw new Error(`Failed to get user LP info: ${error.message}`);
        }
    }
    
    // Calculate optimal liquidity amounts
    async calculateOptimalLiquidity(tokenAmount) {
        try {
            const [tokenReserve, stableReserve] = await Promise.all([
                this.execute('tokenReserve'),
                this.execute('stableReserve')
            ]);
            
            const ratio = stableReserve.result / tokenReserve.result;
            const optimalStableAmount = tokenAmount * ratio;
            
            return {
                tokenAmount: tokenAmount,
                stableAmount: optimalStableAmount,
                ratio: ratio
            };
        } catch (error) {
            throw new Error(`Failed to calculate optimal liquidity: ${error.message}`);
        }
    }
}

// Utility functions
async function deploymentWorkflow() {
    const manager = new PoolManager();
    
    console.log('🚀 Starting Pool Deployment Workflow...');
    
    try {
        // 1. Initialize pool
        console.log('1. Initializing pool...');
        // await manager.execute('initialize', brandToken, stablecoin, brandId, managerAddress);
        
        // 2. Set initial fee
        console.log('2. Setting initial fee...');
        // await manager.execute('setFee', 30); // 0.3%
        
        // 3. Get pool overview
        console.log('3. Getting pool overview...');
        const overview = await manager.getPoolOverview();
        console.log('Pool Overview:', overview);
        
        console.log('✅ Pool deployment workflow completed!');
    } catch (error) {
        console.error('❌ Deployment workflow failed:', error.message);
    }
}

async function liquidityWorkflow(userAddress, tokenAmount) {
    const manager = new PoolManager();
    
    console.log('🏊 Starting Liquidity Provision Workflow...');
    
    try {
        // 1. Calculate optimal amounts
        console.log('1. Calculating optimal liquidity amounts...');
        const optimal = await manager.calculateOptimalLiquidity(tokenAmount);
        console.log('Optimal amounts:', optimal);
        
        // 2. Add liquidity
        console.log('2. Adding liquidity...');
        // await manager.execute('addLiquidity', optimal.tokenAmount, optimal.stableAmount, minLpAmount, userAddress);
        
        // 3. Get user LP info
        console.log('3. Getting user LP info...');
        const userInfo = await manager.getUserLPInfo(userAddress);
        console.log('User LP Info:', userInfo);
        
        console.log('✅ Liquidity workflow completed!');
    } catch (error) {
        console.error('❌ Liquidity workflow failed:', error.message);
    }
}

async function tradingWorkflow(isBuyToken, amountIn) {
    const manager = new PoolManager();
    
    console.log('💱 Starting Trading Workflow...');
    
    try {
        // 1. Get current price
        console.log('1. Getting current price...');
        const currentPrice = await manager.execute('getCurrentPrice');
        console.log('Current price:', currentPrice.result);
        
        // 2. Calculate expected output
        console.log('2. Calculating expected output...');
        const expectedOutput = await manager.execute('getAmountOut', isBuyToken, amountIn);
        console.log('Expected output:', expectedOutput);
        
        // 3. Execute swap
        console.log('3. Executing swap...');
        // await manager.execute('swap', isBuyToken, amountIn, minAmountOut);
        
        // 4. Get new price
        console.log('4. Getting new price...');
        const newPrice = await manager.execute('getCurrentPrice');
        console.log('New price:', newPrice.result);
        
        console.log('✅ Trading workflow completed!');
    } catch (error) {
        console.error('❌ Trading workflow failed:', error.message);
    }
}

// Export everything
module.exports = {
    // Core Functions
    runInitialize,
    runAddLiquidity,
    runRemoveLiquidity,
    runSwap,
    runGetAmountOut,
    
    // Management Functions
    runUpdateReferencePrice,
    runPause,
    runUnpause,
    runSetFee,
    runEmergencyWithdraw,
    
    // Information Functions
    runGetCurrentPrice,
    runGetPriceBounds,
    runGetPriceInfo,
    runPaused,
    runBrandId,
    runBrandToken,
    runStablecoin,
    runTokenReserve,
    runStableReserve,
    runManager,
    runFee,
    runReferencePrice,
    runLastReferenceUpdate,
    
    // ERC20 Functions
    runTotalSupply,
    runBalanceOf,
    runAllowance,
    runApprove,
    runTransfer,
    runTransferFrom,
    
    // Constants
    runDEFAULT_FEE,
    runFEE_DENOMINATOR,
    runPRECISION,
    runREFERENCE_UPDATE_INTERVAL,
    runUPPER_BAND_MULTIPLIER,
    runLOWER_BAND_MULTIPLIER,
    runBAND_DENOMINATOR,
    
    // Utilities
    PoolManager,
    deploymentWorkflow,
    liquidityWorkflow,
    tradingWorkflow
};

// CLI interface
if (require.main === module) {
    const [action, ...args] = process.argv.slice(2);
    
    if (!action) {
        console.log('🏊 Pool Contract Scripts');
        console.log('Usage: node index.js <action> [args...]');
        console.log('');
        console.log('Actions:');
        console.log('  overview             - Get pool overview');
        console.log('  user <address>       - Get user LP info');
        console.log('  optimal <amount>     - Calculate optimal liquidity');
        console.log('  deploy               - Run deployment workflow');
        console.log('  trade <buy> <amount> - Run trading workflow');
        process.exit(1);
    }
    
    const manager = new PoolManager();
    
    switch (action) {
        case 'overview':
            manager.getPoolOverview()
                .then(overview => console.log('Pool Overview:', overview))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'user':
            if (!args[0]) {
                console.error('Usage: node index.js user <address>');
                process.exit(1);
            }
            manager.getUserLPInfo(args[0])
                .then(info => console.log('User LP Info:', info))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'optimal':
            if (!args[0]) {
                console.error('Usage: node index.js optimal <tokenAmount>');
                process.exit(1);
            }
            manager.calculateOptimalLiquidity(parseFloat(args[0]))
                .then(optimal => console.log('Optimal Liquidity:', optimal))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'deploy':
            deploymentWorkflow()
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'trade':
            if (!args[0] || !args[1]) {
                console.error('Usage: node index.js trade <isBuyToken> <amountIn>');
                process.exit(1);
            }
            tradingWorkflow(args[0] === 'true', parseFloat(args[1]))
                .catch(error => console.error('Error:', error.message));
            break;
            
        default:
            console.error('Unknown action:', action);
            process.exit(1);
    }
} 