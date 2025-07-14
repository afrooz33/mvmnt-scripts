import { UserPointsService } from '@app/src/users/points/user-points.service'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { EntityManager, In, LessThanOrEqual, Repository } from 'typeorm'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RevertExpiredPayments {
  private batchSize: number
  private revertDuration: number

  constructor(
    @InjectRepository(UserDealPaymentEntity)
    private readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserDealItemPaymentEntity)
    private readonly userPaymentDealItemRepository: Repository<UserDealItemPaymentEntity>,
    private readonly pointsService: UserPointsService,
    private readonly userDonationsService: UserDonationsService,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = 1000
    this.revertDuration = parseInt(this.configService.get('blockchain.revertDuration'))
  }

  revertExpiredPayments = async () => {
    const expiry = new Date().getTime() - this.revertDuration * 1000

    while (true) {
      //  1: Get expired Payments
      const payments = await this.userPaymentDealRepository.find({
        where: {
          status: PAYMENT_STATUS.INITIATED,
          created: LessThanOrEqual(new Date(expiry)),
        },
        select: { id: true },
        take: this.batchSize,
      })
      if (payments.length === 0) break
      const paymentIds = payments.map((payment) => payment.id)

      //  2: Get Payment Items for the expired Payments
      const paymentItems = await this.userPaymentDealItemRepository.find({
        where: {
          payment: {
            id: In(paymentIds),
          },
        },
        select: { id: true },
      })
      const paymentItemIds = paymentItems.map((item) => item.id)

      await this.entityManager.transaction(async (transaction) => {
        //  3: Revert Donation for items
        await this.userDonationsService.revertPaymentItemDonations(paymentItemIds, transaction)
        //  4: Revert Points for items
        await this.pointsService.revertPaymentItemPoints(paymentItemIds, transaction)
        //  5: Update Payment Item status as reverted
        await transaction.update(
          UserDealItemPaymentEntity,
          {
            id: In(paymentItemIds),
          },
          {
            status: PAYMENT_STATUS.REVERTED,
          },
        )
        //  6: Update Payment status as reverted
        await transaction.update(
          UserDealPaymentEntity,
          {
            id: In(paymentIds),
          },
          {
            status: PAYMENT_STATUS.REVERTED,
          },
        )
      })
    }
  }
}
