import { Injectable } from '@nestjs/common'
import BigNumber from 'bignumber.js'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { UserDealItemPaymentEntity } from '@app/src/users/payment/entities/user-deal-item-payment.entity'
import { PAYMENT_STATUS } from '@app/src/users/payment/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { POINTS_STATUS } from '@app/src/users/points/enums'
import { BlockchainService } from '@app/src/blockchain/blockchain.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserPointsService } from '@app/src/users/points/user-points.service'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { TransactionType } from '@app/src/users/payment/modules/confirm/enums'
import { UserPointUpdatesEntity } from '@app/src/users/points/entities/user-points-updates.entity'
import { RafflePurchaseEntity } from '@app/src/users/deal/raffle-purchase/entities/raffle-purchase.entity'

@Injectable()
export class ConfirmPaymentHelper {
  constructor(
    @InjectRepository(UserDealPaymentEntity)
    protected readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(UserPointUpdatesEntity)
    protected readonly userPointUpdatesRepository: Repository<UserPointUpdatesEntity>,
    protected readonly coinMarketCapService: CoinMarketCapService,
    protected readonly blockchainService: BlockchainService,
    protected readonly userPointsService: UserPointsService,
    private readonly eventEmitter: EventEmitter2,
    protected readonly tokenService: TokensService,
  ) {}

  calculateGASRefund = async (
    gasFees: BigNumber,
    transactionType: TransactionType,
    paymentTokenId: string,
  ): Promise<number> => {
    //  1: Get details of MVMNT Token
    const mvmntToken = this.tokenService.getMVMVNTToken()

    //  2: Calculate GAS Fees for the User
    let gasRefund: BigNumber
    switch (transactionType) {
      case TransactionType.DEAL:
        if (paymentTokenId === mvmntToken.id) gasRefund = gasFees
        else gasRefund = gasFees.multipliedBy(2).dividedBy(3)
        break
    }

    //  3: Convert the GAS fees to Points
    const conversionRate = await this.coinMarketCapService.getEthToBaseRate()
    const gasPoints = gasRefund.dividedBy(conversionRate).decimalPlaces(18).toNumber()

    return gasPoints
  }

  updatePayment = async (
    payment: UserDealPaymentEntity,
    paymentItem: UserDealItemPaymentEntity,
    rafflePurchase?: RafflePurchaseEntity,
    point_notes: object = {},
  ) => {
    //  1. Mark parent Payment as completed with GAS Fees
    const gasFees: BigNumber = await this.blockchainService.getGasFees(payment.transaction_hash)
    payment.status = PAYMENT_STATUS.COMPLETED
    payment.gas_fees = gasFees

    //  2: Update Raffle purchase ID if required
    if (rafflePurchase) payment.raffle_purchase = rafflePurchase

    //  2. Calculate GAS fees to divide among payments
    const gasDivision = gasFees.dividedBy(payment.items.length)
    let remainingGas: BigNumber = gasFees

    //  2. Update payment item, points, and Donation
    for (let i = 0; i < payment.items.length; i += 1) {
      //  2.1. Divide the GAS fees for the Payment
      const allocatedGas: BigNumber = i === payment.items.length - 1 ? remainingGas : gasDivision
      payment.items[i].gas_fees = allocatedGas
      remainingGas = remainingGas.minus(gasDivision)

      //  2.2. Update the status of payment Item
      payment.items[i].status = PAYMENT_STATUS.COMPLETED

      //  2.3. Update the status of related Donation and Points
      payment.items[i].donation.status = DONATION_STATUS.COMPLETED
      payment.items[i].donation.gas_fees = allocatedGas
      for (let j = 0; j < payment.items[i].points.length; j += 1) {
        const update = this.userPointUpdatesRepository.create({
          status: POINTS_STATUS.UNLOCKED,
          notes: {
            ...(payment.items[i].points[j].updates.at(-1)?.notes || {}),
            ...point_notes,
          },
        })
        payment.items[i].points[j].updates.push(update)
        payment.items[i].points[j].status = POINTS_STATUS.UNLOCKED
      }
    }

    //  3. Save the Payment
    await payment.save()

    //  4. Refund GAS fees to User
    const userPoints: number = await this.calculateGASRefund(
      gasFees,
      TransactionType.DEAL,
      payment.payment_currency.id,
    )
    await this.userPointsService.savePaymentItemGASPoints(
      userPoints,
      paymentItem,
      payment.payment_currency,
    )

    //  5: Assign stars to Users for the payment
    this.eventEmitter.emit('user.award.deal.stars', payment.id)
  }
}
