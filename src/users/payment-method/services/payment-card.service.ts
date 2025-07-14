import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { PaymentCardsEntity } from '@app/src/users/payment-method/entities/payment-cards.entity'
import { MyService } from '@app/src/shared/base'

@Injectable()
export class PaymentCardsService extends MyService<PaymentCardsEntity> {
  constructor(
    @InjectRepository(PaymentCardsEntity)
    private readonly paymentCardsRepository: Repository<PaymentCardsEntity>,
  ) {
    super(paymentCardsRepository, '/cards')
  }

  async addCard(
    userId: string,
    card_brand: string,
    card_last4: number,
    card_exp_year: number,
    card_exp_month: number,
  ): Promise<PaymentCardsEntity> {
    //  1: Verify the card isn't registered
    const existingCard = await this.paymentCardsRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        card_brand: card_brand,
        card_last4,
        card_exp_year,
        card_exp_month,
      },
    })
    if (existingCard) return existingCard

    //  2: Register the new card
    const cardDetails = await this.updateOne({
      user: {
        id: userId,
      },
      card_brand: card_brand,
      card_last4,
      card_exp_year,
      card_exp_month,
    })

    return cardDetails
  }

  async getCard(cardId: string): Promise<PaymentCardsEntity> {
    const cardDetails: PaymentCardsEntity = await this.documentExists({
      condition: [
        {
          where: {
            id: cardId,
          },
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.CARD_NOT_FOUND,
        args: { id: cardId },
      }),
    })

    return cardDetails
  }

  async getUserCards(userId: string) {
    const userCards: PaymentCardsEntity[] = await this.paymentCardsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    })

    return userCards
  }
}
