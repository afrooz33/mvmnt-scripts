import { JsonRpcProvider } from 'ethers'

let providerInstance: JsonRpcProvider | null = null

export function getProvider(): JsonRpcProvider {
  if (providerInstance) {
    return providerInstance
  }

  const rpcURL = process.env.BLOCKCHAIN_PROVIDER_RPCURL || 'https://sepolia.base.org'

  // Create provider with specific configuration
  providerInstance = new JsonRpcProvider(rpcURL, {
    chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '84532'),
    name: 'base-sepolia',
  })

  // Add error handling
  providerInstance.on('error', (error) => {
    console.error('Provider error:', error)
  })

  return providerInstance
}
