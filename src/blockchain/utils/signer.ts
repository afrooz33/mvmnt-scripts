import { Wallet } from 'ethers'
import { getProvider } from './provider'

let signerInstance: Wallet | null = null

export async function getSigner(userWalletAddress?: string): Promise<Wallet> {
  if (userWalletAddress) {
    // If a user wallet address is provided, create a new signer for that address
    const provider = getProvider()
    return new Wallet(userWalletAddress, provider)
  }

  if (signerInstance) {
    return signerInstance
  }

  // Use the default private key from environment variables
  const privateKey = process.env.BLOCKCHAIN_SIGNER_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('No private key found in environment variables')
  }

  const provider = getProvider()
  signerInstance = new Wallet(privateKey, provider)
  return signerInstance
}
