import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { BTManagerAbi } from '../abi'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

@Injectable()
export class BrandManagerService {
  private provider: ethers.Provider
  public BTManagerContract: ethers.Contract

  constructor(private readonly configService: ConfigService) {
    // Initialize provider and contract
    const rpcURL = this.configService.getOrThrow('blockchain.provider.rpcURL')
    const brandTokenSignerKey = this.configService.getOrThrow(
      'blockchain.contract.brandTokenSigner.key',
    )
    const BTManagerAddress = this.configService.getOrThrow(
      'blockchain.contract.brandManager.address',
    )

    this.provider = new ethers.JsonRpcProvider(rpcURL)
    const signer = new ethers.Wallet(brandTokenSignerKey, this.provider)
    this.BTManagerContract = new ethers.Contract(BTManagerAddress, BTManagerAbi, signer)
  }

  async createToken(
    brandId: string,
    name: string,
    symbol: string,
    creator: string,
  ): Promise<string> {
    try {
      const transaction = await this.BTManagerContract.createToken(brandId, name, symbol, creator)
      const receipt = await transaction.wait()

      // Get token address from event logs
      const event = receipt.logs.find(
        (log) => log.topics[0] === ethers.id('TokenCreated(uint256,address,address,string,string)'),
      )
      const tokenAddress = ethers.dataSlice(event.topics[2], 12) // Get address from topic

      return tokenAddress
    } catch (error) {
      HandleErrors(error)
    }
  }

  async getTokenInfo(brandId: string): Promise<{
    token: string
    name: string
    symbol: string
    owner: string
  }> {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      return await this.BTManagerContract.getTokenInfo(brandIdBN)
    } catch (error) {
      HandleErrors(error)
    }
  }

  // Compatibility method for existing services
  async getBrandTokenInfo(brandId: string): Promise<any> {
    try {
      // Convert UUID to BigNumber for smart contract
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Call the getTokenInfo function
      const tokenInfo = await this.BTManagerContract.getTokenInfo(brandIdBN)

      return {
        token: tokenInfo[0],
        name: tokenInfo[1],
        symbol: tokenInfo[2],
        owner: tokenInfo[3],
      }
    } catch (error) {
      HandleErrors(error)
    }
  }

  // Compatibility method for existing services
  async getLPTokenAddress(brandId: string): Promise<string> {
    try {
      // Convert brandId to bytes32
      const brandIdBN = this.uuidToBigNumber(brandId)

      // Get LP Manager address from BTManager
      const lpManagerAddress = await this.BTManagerContract.lpManager()

      if (!lpManagerAddress || lpManagerAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('LP Manager address not found in BTManager contract')
      }

      // Create LP Manager contract instance
      const lpManagerABI = [
        'function getPool(uint256 brandId) view returns (address poolAddress, uint256 tokenReserve, uint256 stableReserve)',
      ]

      const lpManagerContract = new ethers.Contract(lpManagerAddress, lpManagerABI, this.provider)

      // Get pool address from LP Manager
      const [poolAddress, ,] = await lpManagerContract.getPool(brandIdBN)

      if (!poolAddress || poolAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error(`No LP token found for brand: ${brandId}`)
      }

      return poolAddress
    } catch (error) {
      HandleErrors(error)
    }
  }

  async getBrandOwner(brandId: string): Promise<string> {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      return await this.BTManagerContract.getBrandOwner(brandIdBN)
    } catch (error) {
      console.error('Error getting brand owner:', error)
      throw error
    }
  }

  async transferBrandOwnership(brandId: string, newOwner: string): Promise<void> {
    try {
      const brandIdBN = this.uuidToBigNumber(brandId)
      const transaction = await this.BTManagerContract.transferBrandOwnership(brandIdBN, newOwner)
      await transaction.wait()
    } catch (error) {
      throw error
    }
  }

  async getTokenCount(): Promise<number> {
    try {
      const count = await this.BTManagerContract.getTokenCount()
      return count.toNumber()
    } catch (error) {
      throw error
    }
  }

  async getTokenAt(index: number): Promise<string> {
    try {
      return await this.BTManagerContract.getTokenAt(index)
    } catch (error) {
      throw error
    }
  }

  // Helper method to convert UUID to BigNumber for smart contract
  private uuidToBigNumber(uuid: string): ethers.BigNumberish {
    // Remove hyphens and convert to hex
    const hexString = '0x' + uuid.replace(/-/g, '')

    // Convert to BigNumber
    return ethers.getBigInt(hexString)
  }

  // Method to get token information by token address
  async getTokenInfoByAddress(tokenAddress: string): Promise<{
    name: string
    symbol: string
    decimals: number
    totalSupply: string
  }> {
    try {
      // Create ERC20 token contract instance
      const tokenAbi = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
      ]

      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.provider)

      // Get token information
      const [name, symbol, decimals, totalSupplyBN] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
      ])

      // Convert total supply to string with proper decimal places
      const totalSupply = ethers.formatUnits(totalSupplyBN, decimals)

      return {
        name,
        symbol,
        decimals,
        totalSupply,
      }
    } catch (error) {
      HandleErrors(error)
    }
  }
}
