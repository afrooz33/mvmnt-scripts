import { Test, TestingModule } from '@nestjs/testing'
import { config } from 'dotenv'
import { ConfigModule } from '@nestjs/config'
import { rootConfig } from '@app/config'
import { BlockchainService } from './blockchain.service'
config()

describe('Blockchain Service', () => {
  let blockchainService: BlockchainService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(rootConfig)],
      providers: [BlockchainService],
    }).compile()

    blockchainService = module.get<BlockchainService>(BlockchainService)
    jest.setTimeout(100000)
  })

  describe('Get Gas Fees', () => {
    it('Gets the Gas Fees', async () => {
      const transactionHash = '0xd5fe70b14321d811ef2fe575b34697400f8f7a3c38d763926742aaf67980d5f0'
      const output = await blockchainService.getGasFees(transactionHash)
      expect(output).not.toBeNull()
    })
  })

  describe('Transaction Reverted', () => {
    it('Throws error for Invalid ID', async () => {
      // const transactionHash = '0xd5fe70b14321d811ef2fe575b34697400f8f7a3c38d763926742aaf67980d5f0'
      const transactionHash = '0xd5fe70b14321d811ef2fe575b34697400f8f7a3c38d763926742aaf67980d500'
      try {
        await blockchainService.isTransactionReverted(transactionHash)
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    })

    it('False for Successful Transaction', async () => {
      const transactionHash = '0xd5fe70b14321d811ef2fe575b34697400f8f7a3c38d763926742aaf67980d5f0'
      const output = await blockchainService.isTransactionReverted(transactionHash)
      expect(output).toBe(false)
    })

    it('True for Reverted Transaction', async () => {
      const transactionHash = '0xa0bd9fa5045227992876c4564ddd0551290a61b6dd65232c04b34c211b45261b'
      const output = await blockchainService.isTransactionReverted(transactionHash)
      expect(output).toBe(true)
    })
  })
})
