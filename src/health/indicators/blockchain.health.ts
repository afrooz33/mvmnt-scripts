import { ethers } from 'ethers'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HealthIndicatorResult } from '@nestjs/terminus'

@Injectable()
export class BlockchainHealthIndicator {
  private provider: ethers.JsonRpcProvider

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL')
    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl)
    }
  }

  private getStatus(key: string, isHealthy: boolean, data: any): HealthIndicatorResult {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data,
      },
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.provider) {
        return this.getStatus(key, true, {
          message: 'Blockchain not configured - skipping check',
          status: 'not_configured',
          note: 'Set BLOCKCHAIN_RPC_URL to enable blockchain health checks',
        })
      }

      // Check if blockchain is accessible
      const blockNumber = await this.provider.getBlockNumber()
      const latestBlock = await this.provider.getBlock(blockNumber)

      if (!latestBlock) {
        throw new Error('Unable to fetch latest block')
      }

      // Check if block is recent (within last 5 minutes)
      const blockTime = latestBlock.timestamp
      const currentTime = Math.floor(Date.now() / 1000)
      const timeDiff = currentTime - blockTime

      if (timeDiff > 300) {
        // 5 minutes
        throw new Error(`Blockchain is stale: last block ${timeDiff} seconds ago`)
      }

      return this.getStatus(key, true, {
        message: 'Blockchain is healthy',
        network: await this.provider.getNetwork(),
        latestBlock: blockNumber,
        blockTime: new Date(blockTime * 1000).toISOString(),
        timeDiff: `${timeDiff} seconds`,
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }

  async checkSmartContractHealth(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.provider) {
        return this.getStatus(key, true, {
          message: 'Smart contracts not configured - skipping check',
          status: 'not_configured',
          note: 'Set BLOCKCHAIN_RPC_URL and contract addresses to enable smart contract health checks',
        })
      }

      // Check smart contract addresses from config
      const contractAddresses = {
        donationContract: this.configService.get<string>('DONATION_CONTRACT_ADDRESS'),
        nonprofitContract: this.configService.get<string>('NONPROFIT_CONTRACT_ADDRESS'),
      }

      const contractChecks = {}

      for (const [name, address] of Object.entries(contractAddresses)) {
        if (address) {
          const code = await this.provider.getCode(address)
          contractChecks[name] = {
            address,
            deployed: code !== '0x',
            codeSize: code.length,
          }
        }
      }

      if (Object.keys(contractChecks).length === 0) {
        return this.getStatus(key, true, {
          message: 'No smart contracts configured - skipping check',
          status: 'not_configured',
          note: 'Set DONATION_CONTRACT_ADDRESS and NONPROFIT_CONTRACT_ADDRESS to enable smart contract health checks',
        })
      }

      return this.getStatus(key, true, {
        message: 'Smart contracts are healthy',
        contracts: contractChecks,
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }

  async checkGasPrice(key: string): Promise<HealthIndicatorResult> {
    try {
      if (!this.provider) {
        return this.getStatus(key, true, {
          message: 'Gas price check not configured - skipping check',
          status: 'not_configured',
          note: 'Set BLOCKCHAIN_RPC_URL to enable gas price health checks',
        })
      }

      const gasPrice = await this.provider.getFeeData()

      // Check if gas price is reasonable (not too high)
      const maxGasPrice = ethers.parseUnits('100', 'gwei') // 100 gwei

      if (gasPrice.gasPrice && gasPrice.gasPrice > maxGasPrice) {
        throw new Error(`Gas price too high: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`)
      }

      return this.getStatus(key, true, {
        message: 'Gas price is reasonable',
        gasPrice: gasPrice.gasPrice
          ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') + ' gwei'
          : 'unknown',
        maxFeePerGas: gasPrice.maxFeePerGas
          ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') + ' gwei'
          : 'unknown',
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
          ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') + ' gwei'
          : 'unknown',
      })
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
        error: error.stack,
      })
    }
  }
}
