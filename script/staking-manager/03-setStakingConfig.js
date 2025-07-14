/**
 * 03-setStakingConfig.js
 * StakingManager SetStakingConfig Script
 * Purpose: Sets staking configuration for a brand
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runSetStakingConfig(brandId, baseRewardRate, bonusRewardRate, maxLockPeriod, minStakeAmount) {
    try {
        console.log('🚀 Starting SetStakingConfig Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
        
        console.log('📝 Caller Address:', await signer.getAddress());
        
        // Get contract address
        const stakingManagerAddress = process.env.STAKING_MANAGER_CONTRACT_ADDRESS;
        if (!stakingManagerAddress) {
            throw new Error('❌ STAKING_MANAGER_CONTRACT_ADDRESS not found in .env');
        }
        
        // Validate inputs
        if (!brandId) {
            throw new Error('❌ Brand ID is required');
        }
        
        // Convert string inputs to proper formats
        const baseRate = baseRewardRate ? ethers.parseEther(baseRewardRate.toString()) : ethers.parseEther('0.1'); // 10% default
        const bonusRate = bonusRewardRate ? ethers.parseEther(bonusRewardRate.toString()) : ethers.parseEther('0.05'); // 5% default
        const maxLock = maxLockPeriod ? parseInt(maxLockPeriod) : 31536000; // 1 year default
        const minStake = minStakeAmount ? ethers.parseEther(minStakeAmount.toString()) : ethers.parseEther('100'); // 100 tokens default
        
        console.log('🎯 Configuration Parameters:');
        console.log('   - Brand ID:', brandId);
        console.log('   - Base Reward Rate:', ethers.formatEther(baseRate), '(scaled)');
        console.log('   - Bonus Reward Rate:', ethers.formatEther(bonusRate), '(scaled)');
        console.log('   - Max Lock Period:', maxLock, 'seconds');
        console.log('   - Min Stake Amount:', ethers.formatEther(minStake), 'tokens');
        
        // Load contract
                        // Load StakingManager contract
        const { StakingManagerABI } = require('./abi/StakingManager.abi.js');
        const StakingManager = new ethers.Contract(stakingManagerAddress, StakingManagerABI, signer);
        
        console.log('⏳ Setting staking configuration...');
        
        const tx = await StakingManager.setStakingConfig(
            brandId,
            baseRate,
            bonusRate,
            maxLock,
            minStake
        );
        
        console.log('📤 Transaction Hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas Used:', receipt.gasUsed.toString());
        
        // Verify configuration was set
        try {
            const configValues = await StakingManager.getStakingConfigValues(brandId);
            console.log('✅ Configuration verified:');
            console.log('   - Min Stake Amount:', ethers.formatEther(configValues.minStakeAmount));
            console.log('   - Base Reward Rate:', ethers.formatEther(configValues.baseRewardRate));
            console.log('   - Bonus Reward Rate:', ethers.formatEther(configValues.bonusRewardRate));
            console.log('   - Max Lock Period:', configValues.maxLockPeriod.toString());
            
            console.log('🎉 SetStakingConfig completed successfully!');
            
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                brandId: brandId,
                configuration: {
                    minStakeAmount: ethers.formatEther(configValues.minStakeAmount),
                    baseRewardRate: ethers.formatEther(configValues.baseRewardRate),
                    bonusRewardRate: ethers.formatEther(configValues.bonusRewardRate),
                    maxLockPeriod: configValues.maxLockPeriod.toString()
                }
            };
            
        } catch (verifyError) {
            console.warn('⚠️ Verification failed but transaction succeeded');
            return {
                success: true,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
                warning: 'Could not verify configuration'
            };
        }
        
    } catch (error) {
        console.error('❌ SetStakingConfig failed:', error.message);
        
        // Check for common errors
        if (error.message.includes('Unauthorized')) {
            return {
                success: false,
                error: 'Only brand owner can set configuration',
                code: 'UNAUTHORIZED'
            };
        }
        
        if (error.message.includes('InvalidParameters')) {
            return {
                success: false,
                error: 'Invalid configuration parameters provided',
                code: 'INVALID_PARAMETERS'
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
    // Get parameters from command line args
    const [brandId, baseRewardRate, bonusRewardRate, maxLockPeriod, minStakeAmount] = process.argv.slice(2);
    
    if (!brandId) {
        console.error('❌ Usage: node 03-setStakingConfig.js <brandId> [baseRewardRate] [bonusRewardRate] [maxLockPeriod] [minStakeAmount]');
        console.error('   Example: node 03-setStakingConfig.js "brand-123" 0.1 0.05 31536000 100');
        process.exit(1);
    }
    
    runSetStakingConfig(brandId, baseRewardRate, bonusRewardRate, maxLockPeriod, minStakeAmount)
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runSetStakingConfig }; 
