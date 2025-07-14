import BigNumber from 'bignumber.js'
import { In, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectRepository } from '@nestjs/typeorm'
import { DealType } from '@app/src/users/deal/enums'
import { UserStarsEntity } from '@app/src/users/stars/entities/stars.entity'
import { InvitationEntity } from '@app/src/users/invitation/entities/invitation.entity'
import { ContributionStarType, StarActionType, StarType } from '@app/src/users/stars/enums'
import { UserDealPaymentEntity } from '@app/src/users/payment/entities/user-deal-payment.entity'
import { ContributionStarsService } from './contribution-stars.service'

@Injectable()
export class DealStarsService {
  constructor(
    @InjectRepository(UserStarsEntity)
    private readonly starsRepository: Repository<UserStarsEntity>,
    @InjectRepository(UserDealPaymentEntity)
    private readonly dealPaymentRepository: Repository<UserDealPaymentEntity>,
    @InjectRepository(InvitationEntity)
    private readonly invitationRepository: Repository<InvitationEntity>,
    private readonly contributionStarService: ContributionStarsService,
  ) {
    // Bind the method to preserve 'this' context
    this.addDealStars = this.addDealStars.bind(this)
  }

  @OnEvent('user.award.deal.stars')
  async addDealStars(paymentId: string) {
    //  1. Get Deal Data
    const dealData = await this.getDealData(paymentId)

    //  2. Give Deal stars to Users
    const dealStars: UserStarsEntity[] = this.createDealStars(
      dealData.dealAmount,
      dealData.donationAmount,
      dealData.buyer.id,
      dealData.seller.id,
      dealData.buyerReferrerId,
      dealData.sellerReferrerId,
      paymentId,
      dealData.dealType,
    )

    // 3. Store stars in the Database
    await this.starsRepository.save(dealStars)
  }

  private async getDealData(paymentId: string) {
    //  1: Get Deal Payment Information
    const dealPayment = await this.dealPaymentRepository.findOne({
      where: {
        id: paymentId,
      },
      relations: {
        items: {
          sender: true,
          receiver: true,
        },
      },
    })

    //  2. Get details of the invitations for each User
    const invitations = await this.invitationRepository.find({
      where: {
        user: {
          id: In([dealPayment.items[0].sender.id, dealPayment.items[0].receiver.id]),
        },
      },
      relations: {
        user: true,
        invited_by: true,
      },
      select: {
        user: {
          id: true,
        },
        invited_by: {
          id: true,
        },
      },
    })

    let buyerReferrerId: string | null, sellerReferrerId: string | null
    for (const invitation of invitations) {
      if (invitation.user.id === dealPayment.items[0].sender.id) {
        buyerReferrerId = invitation.invited_by.id
      }
      if (invitation.user.id === dealPayment.items[0].receiver.id) {
        sellerReferrerId = invitation.invited_by.id
      }
    }

    return {
      dealAmount: dealPayment.deal_amount,
      donationAmount: dealPayment.donation_amount,
      buyer: dealPayment.items[0].sender,
      seller: dealPayment.items[0].receiver,
      buyerReferrerId,
      sellerReferrerId,
      dealType: dealPayment.deal_type,
    }
  }

  private createDealStars(
    dealAmount: BigNumber,
    donationAmount: BigNumber,
    buyerId: string,
    sellerId: string,
    buyerReferrerId: string | null,
    sellerReferrerId: string | null,
    paymentId: string,
    dealType: DealType,
  ): UserStarsEntity[] {
    let purchaseType: StarActionType
    switch (dealType) {
      case DealType.BUYNOW:
        purchaseType = StarActionType.PURCHASE_BUYNOW
        break
      case DealType.RAFFLE:
        purchaseType = StarActionType.PURCHASE_RAFFLE
        break
      case DealType.AUCTION:
        purchaseType = StarActionType.PURCHASE_AUCTION
        break
    }
    const stars = [
      //  1: Stars for Buyer
      this.starsRepository.create({
        user: {
          id: buyerId,
        },
        type: StarType.TRANSACTION,
        stars: dealAmount.toNumber(),
        deal_payment: {
          id: paymentId,
        },
        action: purchaseType,
      }),
      //  2: Stars for Seller
      this.starsRepository.create({
        user: {
          id: sellerId,
        },
        type: StarType.TRANSACTION,
        stars: dealAmount.toNumber(),
        deal_payment: {
          id: paymentId,
        },
        action: purchaseType,
      }),
    ]
    //  3: Stars for buyer referrer
    if (buyerReferrerId)
      stars.push(
        this.contributionStarService.createContributionStar(
          buyerReferrerId,
          ContributionStarType.INVITED_PURCHASE,
          StarActionType.INVITED_PURCHASE,
          paymentId,
        ),
      )

    //  4: Stars for seller referrer
    if (sellerReferrerId)
      stars.push(
        this.contributionStarService.createContributionStar(
          sellerReferrerId,
          ContributionStarType.INVITED_SALE,
          StarActionType.INVITED_SALE,
          paymentId,
        ),
      )

    if (donationAmount.isGreaterThan(0)) {
      stars.push(
        //  1: Stars for Donor
        this.starsRepository.create({
          user: {
            id: buyerId,
          },
          type: StarType.DONATION,
          stars: donationAmount.toNumber(),
          deal_payment: {
            id: paymentId,
          },
        }),
      )

      //  2: Stars for Donor referrer
      if (buyerReferrerId)
        stars.push(
          this.contributionStarService.createContributionStar(
            buyerReferrerId,
            ContributionStarType.INVITED_DIRECT_DONATION,
            StarActionType.INVITED_SALE,
            paymentId,
          ),
        )
    }

    return stars
  }
}
