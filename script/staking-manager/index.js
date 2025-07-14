/**
 * index.js
 * StakingManager Scripts Index
 * Purpose: Exports all StakingManager function scripts
 */

// Import all scripts
const { runConstructor } = require('./01-constructor');
const { runInitialize } = require('./02-initialize');
const { runSetStakingConfig } = require('./03-setStakingConfig');
const { runStakeBrandToken } = require('./04-stakeBrandToken');
const { runStakeLPToken } = require('./05-stakeLPToken');
const { runUnstake } = require('./06-unstake');
const { runClaimReward } = require('./07-claimReward');

// Import generated scripts
const { runCalculateReward } = require('./08-calculateReward');
const { runGetUserStakes } = require('./09-getUserStakes');
const { runHasActiveStake } = require('./10-hasActiveStake');
const { runGetTotalStaked } = require('./11-getTotalStaked');
const { runGetTotalLPStaked } = require('./12-getTotalLPStaked');
const { runGetTotalUserStake } = require('./13-getTotalUserStake');
const { runGetStakingConfigValues } = require('./14-getStakingConfigValues');
const { runGetCurrentAPY } = require('./15-getCurrentAPY');
const { runGetAPYHistory } = require('./16-getAPYHistory');
const { runCalculateTVL } = require('./17-calculateTVL');
const { runCalculateBrandTokenAPY } = require('./18-calculateBrandTokenAPY');
const { runCalculateLPTokenAPY } = require('./19-calculateLPTokenAPY');
const { runPauseBrandStaking } = require('./20-pauseBrandStaking');
const { runUnpauseBrandStaking } = require('./21-unpauseBrandStaking');
const { runPause } = require('./22-pause');
const { runUnpause } = require('./23-unpause');
const { runUpdateBTManager } = require('./24-updateBTManager');
const { runNotifyTradingVolume } = require('./25-notifyTradingVolume');
const { runUpdateAPY } = require('./26-updateAPY');
const { runHasActiveStakeUint } = require('./27-hasActiveStakeUint');
const { runStakeBrandTokenUint } = require('./28-stakeBrandTokenUint');
const { runStakeLPTokenUint } = require('./29-stakeLPTokenUint');
const { runUnstakeUint } = require('./30-unstakeUint');
const { runClaimRewardUint } = require('./31-claimRewardUint');
const { runGetTotalUserStakeUint } = require('./32-getTotalUserStakeUint');
const { runGetTotalStakedUint } = require('./33-getTotalStakedUint');
const { runGetTotalLPStakedUint } = require('./34-getTotalLPStakedUint');
const { runCalculateRewardUint } = require('./35-calculateRewardUint');
const { runGetUserStakesUint } = require('./36-getUserStakesUint');
const { runGetStakingConfigValuesUint } = require('./37-getStakingConfigValuesUint');
const { runGetCurrentAPYUint } = require('./38-getCurrentAPYUint');

module.exports = {
    // Core functions
    runConstructor,
    runInitialize,
    runSetStakingConfig,
    runStakeBrandToken,
    runStakeLPToken,
    runUnstake,
    runClaimReward,
    
    // Generated functions
    runCalculateReward,
    runGetUserStakes,
    runHasActiveStake,
    runGetTotalStaked,
    runGetTotalLPStaked,
    runGetTotalUserStake,
    runGetStakingConfigValues,
    runGetCurrentAPY,
    runGetAPYHistory,
    runCalculateTVL,
    runCalculateBrandTokenAPY,
    runCalculateLPTokenAPY,
    runPauseBrandStaking,
    runUnpauseBrandStaking,
    runPause,
    runUnpause,
    runUpdateBTManager,
    runNotifyTradingVolume,
    runUpdateAPY,
    runHasActiveStakeUint,
    runStakeBrandTokenUint,
    runStakeLPTokenUint,
    runUnstakeUint,
    runClaimRewardUint,
    runGetTotalUserStakeUint,
    runGetTotalStakedUint,
    runGetTotalLPStakedUint,
    runCalculateRewardUint,
    runGetUserStakesUint,
    runGetStakingConfigValuesUint,
    runGetCurrentAPYUint
};
