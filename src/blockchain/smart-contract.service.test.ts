import { Test, TestingModule } from '@nestjs/testing'
import { config } from 'dotenv'
import { ConfigModule } from '@nestjs/config'
import { rootConfig } from '@app/config'
import { SmartContractService } from './smart-contract.service'
import { TokensModule } from '@app/src/admin/tokens/tokens.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
config()

describe('Smart Contract Service', () => {
  let smartContractService: SmartContractService
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(rootConfig),
        TokensModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TYPEORM_DB_HOST,
          port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
          username: process.env.TYPEORM_USERNAME,
          password: process.env.TYPEORM_PASSWORD,
          database: process.env.TYPEORM_DATABASE,
          entities: [TokenWhitelistEntity],
          logging: false,
          synchronize: false,
        }),
      ],
      providers: [SmartContractService],
    }).compile()

    smartContractService = module.get<SmartContractService>(SmartContractService)
    jest.setTimeout(100000)
  })

  afterAll(async () => {
    await module.close()
  })

  describe('All', () => {
    it('Gets the Unsettled Donations', async () => {
      const nonprofitVault = '0x97ce8f152f9d80f87d53ded177e7c89c02c4f197'
      const tokenAddress = '0xd55d3c1e97db41807dfbe3d7f67174d774dfd711'
      const balance = await smartContractService.getUnsettledDonations(nonprofitVault, tokenAddress)
      expect(balance).not.toBeNull()
    })

    it('Gets withdrawable Funds', async () => {
      const nonprofitVault = '0x97ce8f152f9d80f87d53ded177e7c89c02c4f197'
      const tokenAddress = '0xd55d3c1e97db41807dfbe3d7f67174d774dfd711'
      const balance = await smartContractService.getWithdrawableFunds(nonprofitVault, tokenAddress)
      expect(balance).not.toBeNull()
    })
  })
})
