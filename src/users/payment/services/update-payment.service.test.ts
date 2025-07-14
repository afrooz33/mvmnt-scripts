import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { config } from 'dotenv'
import { PaymentUpdateService } from './update-payment.service'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
config()

describe('Update Payment', () => {
  let updateService: PaymentUpdateService
  let module: TestingModule
  const userId = '86840c31-1d66-4707-9113-db00298b75dc'
  const paymentId = {
    existing: '34c55ac0-0979-43f3-9b2a-a2663b335eed',
    updated: '3506cb0f-e96e-4b8d-befe-a173315cf57a',
    new: '3506cb0f-e96e-4b8d-befe-a173315cf57c',
  }

  afterAll(async () => {
    await module.close()
  })

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TYPEORM_DB_HOST,
          port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
          username: process.env.TYPEORM_USERNAME,
          password: process.env.TYPEORM_PASSWORD,
          database: process.env.TYPEORM_DATABASE,
          autoLoadEntities: true,
          entities: ['**/*.entity.ts'],
          logging: false,
          synchronize: false,
        }),
        TypeOrmModule.forFeature([UserDealPaymentEntity]),
      ],
      providers: [PaymentUpdateService, UserDealPaymentEntity],
    }).compile()

    updateService = module.get<PaymentUpdateService>(PaymentUpdateService)
  })

  describe('Update Payment Test', () => {
    it('Existing Payment', async () => {
      await expect(
        updateService.updateTransactionHash(
          {
            transaction_hash: 'SomeHashToUpdate',
            transaction: paymentId.existing,
          },
          userId,
        ),
      ).resolves.not.toThrow()
    })

    it('Updated Payment', async () => {
      await expect(
        updateService.updateTransactionHash(
          {
            transaction_hash: 'SomeHashToUpdate',
            transaction: paymentId.updated,
          },
          userId,
        ),
      ).rejects.toThrow()
    })

    it('Non-Existing Payment', async () => {
      await expect(
        updateService.updateTransactionHash(
          {
            transaction_hash: 'SomeHashToUpdate',
            transaction: paymentId.new,
          },
          userId,
        ),
      ).rejects.toThrow()
    })
  })
})
