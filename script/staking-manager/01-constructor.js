/**
 * 01-constructor.js
 * StakingManager Constructor Script
 * Purpose: Deploys StakingManager contract using proxy pattern
 */

const { ethers } = require('ethers');
require('dotenv').config({
    path: "../../.env"
});

async function runConstructor() {
    try {
        console.log('🚀 Starting StakingManager Constructor Script...');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER_RPCURL);
        const signer = new ethers.Wallet(process.env.ADMIN_KEY, provider);
        
        console.log('📝 Deployer Address:', await signer.getAddress());
        
        // Load contract factory
        const StakingManager = await ethers.getContractFactory('StakingManager', signer);
        
        // Deploy implementation contract
        console.log('⏳ Deploying StakingManager implementation...');
        const stakingManagerImpl = await StakingManager.deploy();
        await stakingManagerImpl.waitForDeployment();
        
        const implAddress = await stakingManagerImpl.getAddress();
        console.log('✅ StakingManager Implementation deployed at:', implAddress);
        
        // Deploy proxy contract
        const ERC1967Proxy = await ethers.getContractFactory('ERC1967Proxy', signer);
        
        // Empty initialization data (constructor disables initializers)
        const initData = '0x';
        
        console.log('⏳ Deploying Proxy contract...');
        const proxy = await ERC1967Proxy.deploy(implAddress, initData);
        await proxy.waitForDeployment();
        
        const proxyAddress = await proxy.getAddress();
        console.log('✅ Proxy deployed at:', proxyAddress);
        
        // Verify deployment
        const code = await provider.getCode(proxyAddress);
        if (code === '0x') {
            throw new Error('❌ Proxy deployment failed - no code at address');
        }
        
        console.log('🎉 Constructor completed successfully!');
        console.log('📋 Summary:');
        console.log('   - Implementation Address:', implAddress);
        console.log('   - Proxy Address:', proxyAddress);
        console.log('   - Gas Used: Calculating...');
        
        return {
            success: true,
            implementationAddress: implAddress,
            proxyAddress: proxyAddress
        };
        
    } catch (error) {
        console.error('❌ Constructor failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    runConstructor()
        .then(result => {
            console.log('📊 Final Result:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { runConstructor }; 