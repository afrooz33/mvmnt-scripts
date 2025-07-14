import { Injectable } from '@nestjs/common'
import { ContributionStarType, StarActionType, StarType } from '@app/src/users/stars/enums'
import { UserDonationPaymentEntity } from '@app/src/users/payment/entities/user-donation-payment.entity'
import { UserStarsEntity } from '@app/src/users/stars/entities/stars.entity'
import BigNumber from 'bignumber.js'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { InvitationEntity } from '@app/src/users/invitation/entities/invitation.entity'
import { ContributionStarsService } from './contribution-stars.service'
import { OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class DonationStarsService {
  constructor(
    @InjectRepository(UserStarsEntity)
    private readonly starsRepository: Repository<UserStarsEntity>,
    @InjectRepository(UserDonationPaymentEntity)
    private readonly donationPaymentRepository: Repository<UserDonationPaymentEntity>,
    @InjectRepository(InvitationEntity)
    private readonly invitationRepository: Repository<InvitationEntity>,
    private readonly contributionStarService: ContributionStarsService,
  ) {}

  @OnEvent('user.award.donation.stars')
  async addDonationStars(paymentId: string) {
    //  1. Get Donation Data
    const donationData = await this.getDonationData(paymentId)

    //  2. Give Donation stars to Users
    const stars = this.createDonationStars(
      donationData.donationAmount,
      donationData.donor.id,
      donationData.donorReferrerId,
      paymentId,
    )

    //  3. Save the stars in the database
    await this.starsRepository.save(stars)
  }

  private async getDonationData(paymentId: string) {
    //  1: Get Donation payment information
    const donation = await this.donationPaymentRepository.findOne({
      where: {
        id: paymentId,
      },
      relations: {
        user: true,
      },
      select: {
        id: true,
        donation_amount: true as any,
        user: {
          id: true,
        },
      },
    })

    //  2: Get invitation for donor
    const invitation = await this.invitationRepository.findOne({
      where: {
        user: {
          id: donation.user.id,
        },
      },
      relations: {
        invited_by: true,
      },
      select: {
        invited_by: {
          id: true,
        },
      },
    })

    return {
      donationAmount: donation.donation_amount,
      donor: donation.user,
      donorReferrerId: invitation?.invited_by?.id,
    }
  }

  private createDonationStars(
    donationAmount: BigNumber,
    donorId: string,
    donorReferrer: string | null,
    donationPaymentId: string,
  ): UserStarsEntity[] {
    const stars = [
      //  1: Stars for Donor
      this.starsRepository.create({
        user: {
          id: donorId,
        },
        type: StarType.DONATION,
        stars: donationAmount.toNumber(),
        donation_payment: {
          id: donationPaymentId,
        },
        action: StarActionType.DIRECT_DONATION,
      }),
    ]

    //  2: Stars for Donor referrer
    if (donorReferrer)
      stars.push(
        this.contributionStarService.createContributionStar(
          donorReferrer,
          ContributionStarType.INVITED_DIRECT_DONATION,
          StarActionType.INVITED_DIRECT_DONATION,
          null,
          donationPaymentId,
        ),
      )

    return stars
  }
}
