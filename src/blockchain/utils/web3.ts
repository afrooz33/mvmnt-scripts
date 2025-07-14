import { ethers } from 'ethers'

let provider: ethers.Provider

export function getProvider(): ethers.Provider {
  if (!provider) {
    const rpcUrl = process.env.RPC_URL
    provider = new ethers.JsonRpcProvider(rpcUrl)
  }
  return provider
}

export function getSigner(userWalletAddress?: string): ethers.Signer {
  const provider = getProvider()
  const privateKey = userWalletAddress
    ? process.env.PRIVATE_KEY || ''
    : process.env.DEFAULT_PRIVATE_KEY || ''
  return new ethers.Wallet(privateKey, provider)
}
