/**
 * 05-stakeLPToken.js
 * StakingManager StakeLPToken Script
 * Purpose: Stakes LP tokens for a user
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runStakeLPToken(brandId, amount, lockPeriod, userPrivateKey = null) {
    try {
        console.log('🚀 Starting StakeLPToken Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signerKey = userPrivateKey || process.env.USER_PRIVATE_KEY || process.env.ADMIN_KEY;
        const signer = new ethers.Wallet(signerKey, provider);
        
        console.log('📝 Staker Address:', await signer.getAddress());
        
        // Get contract address
        const stakingManagerAddress = process.env.STAKING_MANAGER_CONTRACT_ADDRESS;
        if (!stakingManagerAddress) {
            throw new Error('❌ STAKING_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandId || !amount || !lockPeriod) {
            throw new Error('❌ Brand ID, amount, and lock period are required');
        }
        
        // Convert inputs to proper formats
        const stakeAmount = ethers.parseEther(amount.toString());
        const lockDuration = parseInt(lockPeriod);
        
        console.log('🎯 LP Staking Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Amount:', ethers.formatEther(stakeAmount), 'LP tokens');
        console.log('   - Lock Period:', lockDuration, 'seconds');
        
        // Load contracts
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        // Get LP token address (assuming we have LPManager)
        const lpManagerAddress = process.env.LP_MANAGER;
        if (lpManagerAddress) {
            // Load LPManager contract
            const { LPManagerABI } = require('./abi/LPManager.abi.js');
            const LPManager = new ethers.Contract(lpManagerAddress, LPManagerABI, signer);
            try {
                const poolResult = await LPManager.getPool(brandId);
                console.log('🏊 Pool Result:', poolResult);
                
                // Handle different return formats
                let poolAddress;
                if (Array.isArray(poolResult)) {
                    // If result is an array, take the first element (pool address)
                    poolAddress = poolResult[0];
                } else if (typeof poolResult === 'object' && poolResult.poolAddress) {
                    // If result is an object with poolAddress property
                    poolAddress = poolResult.poolAddress;
                } else {
                    // If result is a single address
                    poolAddress = poolResult;
                }
                
                console.log('🏊 Extracted Pool Address:', poolAddress);
                
                // Check if pool exists (not zero address)
                if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
                    throw new Error('❌ LP pool not found for this brand. Pool may not be created yet.');
                }
                
                // Check if user has enough LP tokens
                // Load LPToken contract
                const { IERC20ABI } = require('./abi/IERC20.abi.js');
                const LPToken = new ethers.Contract(poolAddress, IERC20ABI, signer);
                const balance = await LPToken.balanceOf(await signer.getAddress());
                console.log('💰 User LP Balance:', ethers.formatEther(balance), 'LP tokens');
                
                if (balance < stakeAmount) {
                    throw new Error('❌ Insufficient LP token balance');
                }
                
                // Check allowance
                const allowance = await LPToken.allowance(await signer.getAddress(), stakingManagerAddress);
                console.log('✅ Current Allowance:', ethers.formatEther(allowance), 'LP tokens');
                
                if (allowance < stakeAmount) {
                    console.log('⏳ Approving LP tokens for staking...');
                    const approveTx = await LPToken.approve(stakingManagerAddress, stakeAmount);
                    await approveTx.wait();
                    console.log('✅ LP Token approval completed');
                }
            } catch (err) {
                console.warn('⚠️ Could not check LP token balance/allowance:', err.message);
            }
        }
        
        console.log('⏳ Staking LP tokens...');
        
        const tx = await StakingManager.stakeLPToken(brandId, stakeAmount, lockDuration);
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Parse events to get stake ID
        let stakeId = null;
        for (const log of receipt.logs) {
            try {
                const parsedLog = StakingManager.interface.parseLog(log);
                if (parsedLog.name === 'Staked') {
                    stakeId = parsedLog.args.stakeId.toString();
                    console.log('🆔 LP Stake ID:', stakeId);
                    break;
                }
            } catch (err) {
                // Not a StakingManager event
            }
        }
        
        // Verify stake was created
        try {
            const userStakes = await StakingManager.getUserStakes(brandId, await signer.getAddress());
            console.log('📊 Total User Stakes:', userStakes.length);
            
            console.log('🎉 StakeLPToken completed successfully!');
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                stakeId: stakeId,
                brandId: brandId,
                amount: ethers.formatEther(stakeAmount),
                lockPeriod: lockDuration,
                tokenType: 'LP'
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                stakeId: stakeId,
                warning: 'Could not verify LP stake creation'
            };
        }
        
    } catch (error) {
        console.error('❌ StakeLPToken failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('BrandNotConfigured')) {
            return {
                success: false,
                error: 'Brand staking not configured',
                code: 'BRAND_NOT_CONFIGURED'
            };
        }
        
        if (error.message.includes('StakingPaused')) {
            return {
                success: false,
                error: 'Brand staking is currently paused',
                code: 'STAKING_PAUSED'
            };
        }
        
        if (error.message.includes('InvalidStakeAmount')) {
            return {
                success: false,
                error: 'Stake amount is below minimum required',
                code: 'INVALID_STAKE_AMOUNT'
            };
        }
        
        if (error.message.includes('InvalidLockPeriod')) {
            return {
                success: false,
                error: 'Lock period exceeds maximum allowed',
                code: 'INVALID_LOCK_PERIOD'
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
    const [brandId, amount, lockPeriod, userPrivateKey] = process.argv.slice(2);
    
    if (!brandId || !amount || !lockPeriod) {
        console.error('❌ Usage: node 05-stakeLPToken.js <brandId> <amount> <lockPeriod> [userPrivateKey]');
        console.error('   Example: node 05-stakeLPToken.js "brand-123" 500 2592000');
        process.exit(1);
    }
    
    runStakeLPToken(brandId, amount, lockPeriod, userPrivateKey)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runStakeLPToken }; 
