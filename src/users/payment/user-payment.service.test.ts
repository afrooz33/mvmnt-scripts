import { Test } from '@nestjs/testing'
import { UserPaymentService } from './user-payment.service'
import { rootConfig } from '@app/config'
import { UserDealItemPaymentEntity } from './entities/user-deal-item-payment.entity'
import { BuynowCartEntity } from '@app/src/users/deal/buynow/entities/cart.entity'
import { BuynowCartItemEntity } from '@app/src/users/deal/buynow/entities/cart-item.entity'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { UserPointsEntity } from '@app/src/users/points/entities/user-points.entity'
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm'
import { UserDealPaymentEntity } from './entities/user-deal-payment.entity'
import { UserDonationPaymentEntity } from './entities/user-donation-payment.entity'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import { ConfigService } from 'aws-sdk'
import { ConfigModule } from '@nestjs/config'
import { UserPointsModule } from '@app/src/users/points/user-points.module'
import { UserDonationsModule } from '@app/src/donations/user-donations.module'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { config } from 'dotenv'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'
import { NotificationEntity } from '@app/src/notifications/entities/notifications.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { Repository } from 'typeorm'
config()

describe('CatsController', () => {
  let paymentService: UserPaymentService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(rootConfig),
        UserPointsModule,
        UserDonationsModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TYPEORM_DB_HOST,
          port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
          username: process.env.TYPEORM_USERNAME,
          password: process.env.TYPEORM_PASSWORD,
          database: process.env.TYPEORM_DATABASE,
          entities: [
            UserDealPaymentEntity,
            UserDealItemPaymentEntity,
            UserDonationPaymentEntity,
            BuynowCartEntity,
            DealEntity,
            BuynowCartItemEntity,
            RafflePurchaseEntity,
            NotificationEntity,
            UserDonationsEntity,
            UserPointsEntity,
            UserEntity,
          ],
          logging: false,
          synchronize: false,
        }),
        TypeOrmModule.forFeature([
          UserDealPaymentEntity,
          UserDealItemPaymentEntity,
          UserDonationPaymentEntity,
          BuynowCartEntity,
          DealEntity,
          BuynowCartItemEntity,
          RafflePurchaseEntity,
          NotificationEntity,
          UserDonationsEntity,
          UserPointsEntity,
          UserEntity,
        ]),
      ],
      providers: [
        UserPaymentService,
        UserPointsService,
        UserDonationsService,
        ConfigService,
        CoinMarketCapService,
        {
          provide: getRepositoryToken(BuynowCartEntity),
          useClass: Repository,
        },
      ],
    }).compile()

    paymentService = moduleRef.get<UserPaymentService>(UserPaymentService)
  })

  describe('Buy Now Tests', () => {
    it('Should just work', async () => {
      const output = await paymentService.updateTransactionHash(
        {
          transaction: '31b23cff-0bec-4d84-b4bf-ef36a074b9e8',
          transaction_hash: 'Hash',
        },
        '31b23cff-0bec-4d84-b4bf-ef36a074b9e8',
      )

      console.log(output)
    })
  })
})
