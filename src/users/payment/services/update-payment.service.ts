import { IsNull, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { UpdatePaymentHashDto } from '@app/src/users/payment/dto'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'

@Injectable()
export class PaymentUpdateService {
  constructor(
    @InjectRepository(UserDealPaymentEntity)
    protected readonly userPaymentDealRepository: Repository<UserDealPaymentEntity>,
  ) {}

  updateTransactionHash = async (
    payload: UpdatePaymentHashDto,
    userId: string,
  ): Promise<SuccessRO> => {
    //  1. Validate that the payment exists
    const payment = await this.userPaymentDealRepository.findOne({
      where: {
        id: payload.transaction,
        user: {
          id: userId,
        },
        transaction_hash: IsNull(),
      },
    })
    if (!payment) {
      throw new NotFoundException(ErrorKey.PAYMENT_NOT_FOUND)
    }

    //  2. Update the Transaction Hash for the payment
    payment.transaction_hash = payload.transaction_hash
    await payment.save()

    return {
      success: true,
      message: 'Transaction Hash Updated',
      data: payment.toResponseObject(),
    }
  }
}
