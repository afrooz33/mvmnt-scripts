import { ethers } from 'ethers'

// Ethers.js v6 compatibility utilities
export const EthersUtils = {
  // Provider utilities
  JsonRpcProvider: ethers.JsonRpcProvider,
  AbstractProvider: ethers.AbstractProvider,

  // Formatting utilities
  formatEther: ethers.formatEther,
  parseEther: ethers.parseEther,
  formatUnits: ethers.formatUnits,
  parseUnits: ethers.parseUnits,

  // Address utilities
  getAddress: ethers.getAddress,
  isAddress: ethers.isAddress,

  // Hashing utilities
  keccak256: ethers.keccak256,
  hashMessage: ethers.hashMessage,

  // Encoding utilities
  hexlify: ethers.hexlify,
  toUtf8Bytes: ethers.toUtf8Bytes,
  AbiCoder: new ethers.AbiCoder(),

  // Signature utilities
  verifyMessage: ethers.verifyMessage,

  // BigNumber utilities
  toBigInt: (value: any) => ethers.getBigInt(value),

  // Constants
  ZeroAddress: ethers.ZeroAddress,

  // Wallet signing (v6 uses signTypedData)
  signTypedData: async (wallet: ethers.Wallet, domain: any, types: any, value: any) => {
    return wallet.signTypedData(domain, types, value)
  },
}

// Export individual utilities for easier imports
export const {
  JsonRpcProvider,
  AbstractProvider,
  formatEther,
  parseEther,
  formatUnits,
  parseUnits,
  getAddress,
  isAddress,
  keccak256,
  hashMessage,
  hexlify,
  toUtf8Bytes,
  AbiCoder,
  verifyMessage,
  toBigInt,
  ZeroAddress,
  signTypedData,
} = EthersUtils
