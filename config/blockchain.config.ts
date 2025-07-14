export default () => ({
  blockchain: {
    contract: {
      pool: {
        address: process.env.POOL_CONTRACT_ADDRESS,
        version: process.env.POOL_CONTRACT_VERSION || '1.0',
      },
      mvmntManager: {
        address: process.env.MVMNTMANAGER_CONTRACT_ADDRESS,
        version: process.env.MVMNTMANAGER_CONTRACT_VERSION || '1.0',
      },
      withdrawManager: {
        address: process.env.WITHDRAW_MANAGER_ADDRESS,
        version: process.env.WITHDRAW_MANAGER_VERSION || '1.0',
        batchSize: process.env.WITHDRAW_BATCH_SIZE,
      },
      NPVFactory: {
        address: process.env.NPV_FACTORY_ADDRESS,
        version: process.env.NPV_FACTORY_VERSION || '1.0',
      },
      perkNFT: {
        address: process.env.PERK_NFT_ADDRESS || process.env.PERK_NFT,
        version: process.env.PERK_NFT_VERSION || '1.0',
      },
      trustedEntity: {
        key: process.env.TRUSTED_ENTITY_KEY,
      },
      brandTokenSigner: {
        key: process.env.BRAND_TOKEN_SIGNER,
      },
      brandManager: {
        address: process.env.BRAND_MANAGER_ADDRESS,
        version: process.env.BRAND_MANAGER_VERSION || '1.0',
      },
      stakingManager: {
        address: process.env.STAKING_MANAGER_CONTRACT_ADDRESS,
        version: process.env.STAKING_MANAGER_VERSION || '1.0',
      },
      brandTokenImpl: {
        address: process.env.BRAND_TOKEN_IMPL,
        version: process.env.BRAND_TOKEN_IMPL_VERSION || '1.0',
      },
      icoVault: {
        address: process.env.ICO_VAULT,
        version: process.env.ICO_VAULT_VERSION || '1.0',
      },
      icoManager: {
        address: process.env.ICO_MANAGER,
        version: process.env.ICO_MANAGER_VERSION || '1.0',
      },
      lpManager: {
        address: process.env.LP_MANAGER,
        version: process.env.LP_MANAGER_VERSION || '1.0',
      },
      perkManager: {
        address: process.env.PERK_MANAGER_ADDRESS || process.env.PERK_MANAGER,
        version: process.env.PERK_MANAGER_VERSION || '1.0',
      },
      vestingManager: {
        address: process.env.VESTING_MANAGER,
        version: process.env.VESTING_MANAGER_VERSION || '1.0',
      },
      governanceManager: {
        address: process.env.GOVERNANCE_MANAGER,
        version: process.env.GOVERNANCE_MANAGER_VERSION || '1.0',
      },
      tokenManager: {
        address: process.env.TOKEN_MANAGER,
        version: process.env.TOKEN_MANAGER_VERSION || '1.0',
      },
      tradeHandler: {
        address: process.env.TRADE_HANDLER,
        version: process.env.TRADE_HANDLER_VERSION || '1.0',
      },
    },
    chainId: process.env.BLOCKCHAIN_CHAIN_ID,
    adminKey: process.env.ADMIN_KEY,
    coinMarketCapKey: process.env.COIN_MARKET_CAP_KEY,
    signatureExpiry: process.env.SIGNATURE_EXPIRY_MIN || 15,
    provider: {
      rpcURL: process.env.BLOCKCHAIN_PROVIDER_RPCURL,
      network: process.env.BLOCKCHAIN_PROVIDER_NETWORK,
    },
    MVMNTAddress: process.env.MVMNT_ADDRESS,
    ETHAddress: process.env.ETH_ADDRESS,
    revertDuration: process.env.REVERT_DURATION_MINUTES,
    subgraphPublicKey: process.env.SUBGRAPH_PUBLIC_KEY,
    subgraphUrl: process.env.SUBGRAPH_URL,
  },
})
