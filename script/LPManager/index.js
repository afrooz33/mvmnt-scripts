/**
 * index.js
 * LPManager Contract Scripts Index
 * Purpose: Main entry point for LPManager contract interactions
 */

// Core Functions
const { runInitialize } = require('./01-initialize');
const { runCreatePool } = require('./02-createPool');
const { runInitializePool } = require('./03-initializePool');
const { runAddLiquidity } = require('./04-addLiquidity');
const { runRemoveLiquidity } = require('./05-removeLiquidity');
const { runSwap } = require('./06-swap');
const { runGetAmountOut } = require('./07-getAmountOut');
const { runGetPool } = require('./08-getPool');

// Fee Management Functions
const { runOnFeeCollected } = require('./09-onFeeCollected');
const { runClaimAdminFees } = require('./10-claimAdminFees');
const { runClaimBTStakerFees } = require('./11-claimBTStakerFees');
const { runClaimLPProviderFees } = require('./12-claimLPProviderFees');
const { runClaimLPStakerFees } = require('./13-claimLPStakerFees');
const { runGetPendingAdminFees } = require('./14-getPendingAdminFees');
const { runGetPendingBTStakerFees } = require('./15-getPendingBTStakerFees');
const { runGetPendingLPProviderFees } = require('./16-getPendingLPProviderFees');
const { runGetPendingLPStakerFees } = require('./17-getPendingLPStakerFees');

// Information Functions
const { runGetAllPools } = require('./18-getAllPools');
const { runFeePools } = require('./19-feePools');
const { runLpProviderFees } = require('./20-lpProviderFees');
const { runUserLPTokens } = require('./21-userLPTokens');
const { runTotalLPTokens } = require('./22-totalLPTokens');
const { runBrandIds } = require('./23-brandIds');
const { runPools } = require('./24-pools');
const { runBtManager } = require('./25-btManager');
const { runStablecoin } = require('./26-stablecoin');
const { runPoolImplementation } = require('./27-poolImplementation');
const { runDexRouter } = require('./28-dexRouter');
const { runWeth } = require('./29-weth');

// Management Functions
const { runPause } = require('./30-pause');
const { runUnpause } = require('./31-unpause');
const { runPaused } = require('./32-paused');
const { runEmergencyWithdraw } = require('./33-emergencyWithdraw');
const { runUpdateBTManager } = require('./34-updateBTManager');
const { runUpdateImplementation } = require('./35-updateImplementation');

// Ownership Functions
const { runOwner } = require('./36-owner');
const { runTransferOwnership } = require('./37-transferOwnership');
const { runRenounceOwnership } = require('./38-renounceOwnership');
const { runProxiableUUID } = require('./39-proxiableUUID');
const { runUpgradeTo } = require('./40-upgradeTo');
const { runUpgradeToAndCall } = require('./41-upgradeToAndCall');

// Constants
const { runADMIN_SHARE } = require('./42-ADMIN_SHARE');
const { runBT_STAKER_SHARE } = require('./43-BT_STAKER_SHARE');
const { runLP_PROVIDER_SHARE } = require('./44-LP_PROVIDER_SHARE');
const { runLP_STAKER_SHARE } = require('./45-LP_STAKER_SHARE');
const { runSHARE_DENOMINATOR } = require('./46-SHARE_DENOMINATOR');

// LPManager Class
class LPManager {
    constructor() {
        this.functions = {
            // Core Functions
            initialize: runInitialize,
            createPool: runCreatePool,
            initializePool: runInitializePool,
            addLiquidity: runAddLiquidity,
            removeLiquidity: runRemoveLiquidity,
            swap: runSwap,
            getAmountOut: runGetAmountOut,
            getPool: runGetPool,
            
            // Fee Management
            onFeeCollected: runOnFeeCollected,
            claimAdminFees: runClaimAdminFees,
            claimBTStakerFees: runClaimBTStakerFees,
            claimLPProviderFees: runClaimLPProviderFees,
            claimLPStakerFees: runClaimLPStakerFees,
            getPendingAdminFees: runGetPendingAdminFees,
            getPendingBTStakerFees: runGetPendingBTStakerFees,
            getPendingLPProviderFees: runGetPendingLPProviderFees,
            getPendingLPStakerFees: runGetPendingLPStakerFees,
            
            // Information Functions
            getAllPools: runGetAllPools,
            feePools: runFeePools,
            lpProviderFees: runLpProviderFees,
            userLPTokens: runUserLPTokens,
            totalLPTokens: runTotalLPTokens,
            brandIds: runBrandIds,
            pools: runPools,
            btManager: runBtManager,
            stablecoin: runStablecoin,
            poolImplementation: runPoolImplementation,
            dexRouter: runDexRouter,
            weth: runWeth,
            
            // Management Functions
            pause: runPause,
            unpause: runUnpause,
            paused: runPaused,
            emergencyWithdraw: runEmergencyWithdraw,
            updateBTManager: runUpdateBTManager,
            updateImplementation: runUpdateImplementation,
            
            // Ownership Functions
            owner: runOwner,
            transferOwnership: runTransferOwnership,
            renounceOwnership: runRenounceOwnership,
            proxiableUUID: runProxiableUUID,
            upgradeTo: runUpgradeTo,
            upgradeToAndCall: runUpgradeToAndCall,
            
            // Constants
            ADMIN_SHARE: runADMIN_SHARE,
            BT_STAKER_SHARE: runBT_STAKER_SHARE,
            LP_PROVIDER_SHARE: runLP_PROVIDER_SHARE,
            LP_STAKER_SHARE: runLP_STAKER_SHARE,
            SHARE_DENOMINATOR: runSHARE_DENOMINATOR
        };
    }
    
    // Execute any LPManager function
    async execute(functionName, ...args) {
        const func = this.functions[functionName];
        if (!func) {
            throw new Error(`Function ${functionName} not found`);
        }
        return await func(...args);
    }
    
    // Get system overview
    async getSystemOverview() {
        try {
            const [
                owner,
                paused,
                btManager,
                stablecoin,
                poolImplementation,
                dexRouter,
                allPools
            ] = await Promise.all([
                this.execute('owner'),
                this.execute('paused'),
                this.execute('btManager'),
                this.execute('stablecoin'),
                this.execute('poolImplementation'),
                this.execute('dexRouter'),
                this.execute('getAllPools')
            ]);
            
            return {
                owner: owner.result,
                paused: paused.result,
                btManager: btManager.result,
                stablecoin: stablecoin.result,
                poolImplementation: poolImplementation.result,
                dexRouter: dexRouter.result,
                totalPools: allPools.result.length,
                poolBrandIds: allPools.result
            };
        } catch (error) {
            throw new Error(`Failed to get system overview: ${error.message}`);
        }
    }
    
    // Get fee distribution configuration
    async getFeeConfiguration() {
        try {
            const [
                adminShare,
                btStakerShare,
                lpProviderShare,
                lpStakerShare,
                shareDenominator
            ] = await Promise.all([
                this.execute('ADMIN_SHARE'),
                this.execute('BT_STAKER_SHARE'),
                this.execute('LP_PROVIDER_SHARE'),
                this.execute('LP_STAKER_SHARE'),
                this.execute('SHARE_DENOMINATOR')
            ]);
            
            const denominator = Number(shareDenominator.result);
            
            return {
                adminShare: Number(adminShare.result),
                btStakerShare: Number(btStakerShare.result),
                lpProviderShare: Number(lpProviderShare.result),
                lpStakerShare: Number(lpStakerShare.result),
                shareDenominator: denominator,
                percentages: {
                    admin: (Number(adminShare.result) / denominator * 100).toFixed(2) + '%',
                    btStakers: (Number(btStakerShare.result) / denominator * 100).toFixed(2) + '%',
                    lpProviders: (Number(lpProviderShare.result) / denominator * 100).toFixed(2) + '%',
                    lpStakers: (Number(lpStakerShare.result) / denominator * 100).toFixed(2) + '%'
                }
            };
        } catch (error) {
            throw new Error(`Failed to get fee configuration: ${error.message}`);
        }
    }
    
    // Get pool analytics
    async getPoolAnalytics(brandId) {
        try {
            const [
                poolInfo,
                totalLPTokens,
                feePools
            ] = await Promise.all([
                this.execute('getPool', brandId),
                this.execute('totalLPTokens', brandId),
                this.execute('feePools', brandId)
            ]);
            
            return {
                brandId: brandId,
                poolAddress: poolInfo.result.poolAddress,
                tokenReserve: poolInfo.result.tokenReserve,
                stableReserve: poolInfo.result.stableReserve,
                totalLPTokens: totalLPTokens.result,
                feePools: feePools.result,
                liquidityRatio: Number(poolInfo.result.tokenReserve) / Number(poolInfo.result.stableReserve)
            };
        } catch (error) {
            throw new Error(`Failed to get pool analytics: ${error.message}`);
        }
    }
    
    // Get user position info
    async getUserPosition(brandId, userAddress) {
        try {
            const [
                userLPTokens,
                totalLPTokens,
                poolInfo,
                pendingBTStakerFees,
                pendingLPProviderFees,
                pendingLPStakerFees,
                lpProviderFees
            ] = await Promise.all([
                this.execute('userLPTokens', brandId, userAddress),
                this.execute('totalLPTokens', brandId),
                this.execute('getPool', brandId),
                this.execute('getPendingBTStakerFees', brandId, userAddress),
                this.execute('getPendingLPProviderFees', brandId, userAddress),
                this.execute('getPendingLPStakerFees', brandId, userAddress),
                this.execute('lpProviderFees', brandId, userAddress)
            ]);
            
            // Calculate user's share
            const userLP = Number(userLPTokens.result);
            const totalLP = Number(totalLPTokens.result);
            const sharePercentage = totalLP > 0 ? (userLP / totalLP * 100) : 0;
            
            // Calculate underlying assets
            const tokenReserve = Number(poolInfo.result.tokenReserve);
            const stableReserve = Number(poolInfo.result.stableReserve);
            const userTokens = tokenReserve * sharePercentage / 100;
            const userStable = stableReserve * sharePercentage / 100;
            
            return {
                brandId: brandId,
                userAddress: userAddress,
                lpTokens: userLP,
                sharePercentage: sharePercentage.toFixed(4) + '%',
                underlyingAssets: {
                    tokens: userTokens,
                    stable: userStable
                },
                pendingFees: {
                    btStaker: pendingBTStakerFees.result,
                    lpProvider: pendingLPProviderFees.result,
                    lpStaker: pendingLPStakerFees.result
                },
                accumulatedFees: {
                    lpProvider: lpProviderFees.result
                }
            };
        } catch (error) {
            throw new Error(`Failed to get user position: ${error.message}`);
        }
    }
    
    // Calculate optimal liquidity ratios
    async calculateOptimalLiquidity(brandId, tokenAmount) {
        try {
            const poolInfo = await this.execute('getPool', brandId);
            const tokenReserve = Number(poolInfo.result.tokenReserve);
            const stableReserve = Number(poolInfo.result.stableReserve);
            
            if (tokenReserve === 0 || stableReserve === 0) {
                return {
                    tokenAmount: tokenAmount,
                    stableAmount: tokenAmount, // 1:1 ratio for new pools
                    ratio: 1,
                    isNewPool: true
                };
            }
            
            const ratio = stableReserve / tokenReserve;
            const optimalStableAmount = tokenAmount * ratio;
            
            return {
                tokenAmount: tokenAmount,
                stableAmount: optimalStableAmount,
                ratio: ratio,
                isNewPool: false,
                currentReserves: {
                    tokens: tokenReserve,
                    stable: stableReserve
                }
            };
        } catch (error) {
            throw new Error(`Failed to calculate optimal liquidity: ${error.message}`);
        }
    }
}

// Utility functions
async function deploymentWorkflow() {
    const manager = new LPManager();
    
    console.log('🚀 Starting LPManager Deployment Workflow...');
    
    try {
        // 1. Get system overview
        console.log('1. Getting system overview...');
        const overview = await manager.getSystemOverview();
        console.log('System Overview:', overview);
        
        // 2. Get fee configuration
        console.log('2. Getting fee configuration...');
        const feeConfig = await manager.getFeeConfiguration();
        console.log('Fee Configuration:', feeConfig);
        
        console.log('✅ Deployment workflow completed!');
    } catch (error) {
        console.error('❌ Deployment workflow failed:', error.message);
    }
}

async function poolManagementWorkflow(brandId) {
    const manager = new LPManager();
    
    console.log('🏊 Starting Pool Management Workflow...');
    
    try {
        // 1. Get pool analytics
        console.log('1. Getting pool analytics...');
        const analytics = await manager.getPoolAnalytics(brandId);
        console.log('Pool Analytics:', analytics);
        
        // 2. Get optimal liquidity for 1000 tokens
        console.log('2. Calculating optimal liquidity...');
        const optimal = await manager.calculateOptimalLiquidity(brandId, 1000);
        console.log('Optimal Liquidity:', optimal);
        
        console.log('✅ Pool management workflow completed!');
    } catch (error) {
        console.error('❌ Pool management workflow failed:', error.message);
    }
}

async function userManagementWorkflow(brandId, userAddress) {
    const manager = new LPManager();
    
    console.log('👤 Starting User Management Workflow...');
    
    try {
        // 1. Get user position
        console.log('1. Getting user position...');
        const position = await manager.getUserPosition(brandId, userAddress);
        console.log('User Position:', position);
        
        // 2. Get fee configuration for context
        console.log('2. Getting fee structure...');
        const feeConfig = await manager.getFeeConfiguration();
        console.log('Fee Structure:', feeConfig.percentages);
        
        console.log('✅ User management workflow completed!');
    } catch (error) {
        console.error('❌ User management workflow failed:', error.message);
    }
}

async function feeManagementWorkflow(brandId, userAddress) {
    const manager = new LPManager();
    
    console.log('💰 Starting Fee Management Workflow...');
    
    try {
        // 1. Check all pending fees
        console.log('1. Checking pending fees...');
        const [
            adminFees,
            btStakerFees,
            lpProviderFees,
            lpStakerFees
        ] = await Promise.all([
            manager.execute('getPendingAdminFees', brandId),
            manager.execute('getPendingBTStakerFees', brandId, userAddress),
            manager.execute('getPendingLPProviderFees', brandId, userAddress),
            manager.execute('getPendingLPStakerFees', brandId, userAddress)
        ]);
        
        console.log('Pending Fees:');
        console.log('  - Admin:', adminFees.result);
        console.log('  - BT Staker:', btStakerFees.result);
        console.log('  - LP Provider:', lpProviderFees.result);
        console.log('  - LP Staker:', lpStakerFees.result);
        
        // 2. Get fee pool status
        console.log('2. Getting fee pool status...');
        const feePoolStatus = await manager.execute('feePools', brandId);
        console.log('Fee Pool Status:', feePoolStatus.result);
        
        console.log('✅ Fee management workflow completed!');
    } catch (error) {
        console.error('❌ Fee management workflow failed:', error.message);
    }
}

// Export everything
module.exports = {
    // Core Functions
    runInitialize,
    runCreatePool,
    runInitializePool,
    runAddLiquidity,
    runRemoveLiquidity,
    runSwap,
    runGetAmountOut,
    runGetPool,
    
    // Fee Management
    runOnFeeCollected,
    runClaimAdminFees,
    runClaimBTStakerFees,
    runClaimLPProviderFees,
    runClaimLPStakerFees,
    runGetPendingAdminFees,
    runGetPendingBTStakerFees,
    runGetPendingLPProviderFees,
    runGetPendingLPStakerFees,
    
    // Information Functions
    runGetAllPools,
    runFeePools,
    runLpProviderFees,
    runUserLPTokens,
    runTotalLPTokens,
    runBrandIds,
    runPools,
    runBtManager,
    runStablecoin,
    runPoolImplementation,
    runDexRouter,
    runWeth,
    
    // Management Functions
    runPause,
    runUnpause,
    runPaused,
    runEmergencyWithdraw,
    runUpdateBTManager,
    runUpdateImplementation,
    
    // Ownership Functions
    runOwner,
    runTransferOwnership,
    runRenounceOwnership,
    runProxiableUUID,
    runUpgradeTo,
    runUpgradeToAndCall,
    
    // Constants
    runADMIN_SHARE,
    runBT_STAKER_SHARE,
    runLP_PROVIDER_SHARE,
    runLP_STAKER_SHARE,
    runSHARE_DENOMINATOR,
    
    // Utilities
    LPManager,
    deploymentWorkflow,
    poolManagementWorkflow,
    userManagementWorkflow,
    feeManagementWorkflow
};

// CLI interface
if (require.main === module) {
    const [action, ...args] = process.argv.slice(2);
    
    if (!action) {
        console.log('🌐 LPManager Contract Scripts');
        console.log('Usage: node index.js <action> [args...]');
        console.log('');
        console.log('Actions:');
        console.log('  overview              - Get system overview');
        console.log('  fees                  - Get fee configuration');
        console.log('  pool <brandId>        - Get pool analytics');
        console.log('  user <brandId> <addr> - Get user position');
        console.log('  optimal <brandId> <amt> - Calculate optimal liquidity');
        console.log('  deploy                - Run deployment workflow');
        console.log('  manage <brandId>      - Run pool management workflow');
        console.log('  userflow <brandId> <addr> - Run user workflow');
        console.log('  feeflow <brandId> <addr>  - Run fee workflow');
        process.exit(1);
    }
    
    const manager = new LPManager();
    
    switch (action) {
        case 'overview':
            manager.getSystemOverview()
                .then(overview => console.log('System Overview:', overview))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'fees':
            manager.getFeeConfiguration()
                .then(config => console.log('Fee Configuration:', config))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'pool':
            if (!args[0]) {
                console.error('Usage: node index.js pool <brandId>');
                process.exit(1);
            }
            manager.getPoolAnalytics(args[0])
                .then(analytics => console.log('Pool Analytics:', analytics))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'user':
            if (!args[0] || !args[1]) {
                console.error('Usage: node index.js user <brandId> <userAddress>');
                process.exit(1);
            }
            manager.getUserPosition(args[0], args[1])
                .then(position => console.log('User Position:', position))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'optimal':
            if (!args[0] || !args[1]) {
                console.error('Usage: node index.js optimal <brandId> <tokenAmount>');
                process.exit(1);
            }
            manager.calculateOptimalLiquidity(args[0], parseFloat(args[1]))
                .then(optimal => console.log('Optimal Liquidity:', optimal))
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'deploy':
            deploymentWorkflow()
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'manage':
            if (!args[0]) {
                console.error('Usage: node index.js manage <brandId>');
                process.exit(1);
            }
            poolManagementWorkflow(args[0])
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'userflow':
            if (!args[0] || !args[1]) {
                console.error('Usage: node index.js userflow <brandId> <userAddress>');
                process.exit(1);
            }
            userManagementWorkflow(args[0], args[1])
                .catch(error => console.error('Error:', error.message));
            break;
            
        case 'feeflow':
            if (!args[0] || !args[1]) {
                console.error('Usage: node index.js feeflow <brandId> <userAddress>');
                process.exit(1);
            }
            feeManagementWorkflow(args[0], args[1])
                .catch(error => console.error('Error:', error.message));
            break;
            
        default:
            console.error('Unknown action:', action);
            process.exit(1);
    }
} 