import { RecurringDonationSignaturesEntity } from '@app/src/recurring-donations/entities/recurring-donation-signatures.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, LessThanOrEqual, Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { NotificationsService } from '@app/src/notifications/notifications.service'
import { UserDonationsService } from '@app/src/donations/user-donations.service'
import { SmartContractService } from '@app/src/blockchain/smart-contract.service'
import { NotificationType } from '@app/src/notifications/enums/notification-type.enum'
import { NotificationReceiverType } from '@app/src/notifications/enums/notification-receiver-type.enum'
import { NotificationRelatedTo } from '@app/src/notifications/enums/notification-related-to.enum'

@Injectable()
export class ExecuteRecurringService {
  private RECURRING_BATCH_SIZE: number

  constructor(
    @InjectRepository(RecurringDonationSignaturesEntity)
    protected readonly recurringDonationSignaturesRepository: Repository<RecurringDonationSignaturesEntity>,
    protected readonly configService: ConfigService,
    protected readonly userDonationService: UserDonationsService,
    protected readonly smartContractService: SmartContractService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.RECURRING_BATCH_SIZE = parseInt(this.configService.get('app.recurring.batchSize'))
  }

  async executeRecurringDonation() {
    for (let i = 0; ; i += 1) {
      //  1: Get recurring donation details from the Database
      const donationSignatures = await this.recurringDonationSignaturesRepository.find({
        where: {
          usage_date: LessThanOrEqual(new Date(new Date().getTime())),
          is_consumed: false,
          is_deleted: false,
        },
        relations: {
          setting: {
            wallet: true,
            user: true,
            deal: true,
            donation_project: true,
            payment_currency: true,
          },
        },
        select: {
          id: true,
          unique_id: true,
          usage_date: true,
          is_consumed: true,
          is_deleted: true,
          setting: {
            id: true,
            user: {
              id: true,
              username: true,
              display_name: true,
            },
            deal: {
              id: true,
              name: true,
              deal_type: true,
            },
            donation_project: {
              id: true,
              name: true,
              vault_address: true,
            },
            payment_currency: {
              id: true,
              address: true,
            },
            wallet: {
              id: true,
            },
          },
        },
        skip: i * this.RECURRING_BATCH_SIZE,
        take: this.RECURRING_BATCH_SIZE,
      })

      if (donationSignatures.length === 0) break

      //  2. Create entries for execution
      const recurringDonations = []
      const newDonationData = []

      for (const donationSignature of donationSignatures) {
        //  2.1. Initiate Donation to give points and make payment entries in DB
        let newDonation: any
        try {
          newDonation = await this.userDonationService.initiateRecurringDonation(
            donationSignature.setting.user.id,
            {
              donation_project: donationSignature.setting.donation_project.id,
              amount: donationSignature.setting.donation_amount.toString(),
              currency: donationSignature.setting.payment_currency.address,
              payment_method: donationSignature.setting.wallet.id,
              signature: donationSignature.id,
              reason: donationSignature.setting.reason,
            },
            donationSignature.unique_id,
          )
        } catch (err) {
          // TODO: Handle errors in Initiate Donation
          continue
        }

        //  2.2. Update the payment Id for the recurring donation
        donationSignature.payment = newDonation.data.transactionId
        donationSignature.save()

        newDonationData.push({
          id: newDonation.data.transactionId,
          user: donationSignature.setting.user.id,
        })

        const proofString = donationSignature.merkle_proof
          .replace(/"/g, '')
          .replace('{', '')
          .replace('}', '')
        const proof = proofString.split(',')

        recurringDonations.push({
          paymentId: donationSignature.unique_id,
          nonprofitVault: donationSignature.setting.donation_project.vault_address,
          amount: newDonation.data.amount,
          // ToDo: Update the donor address
          donor: newDonation.data.donor,
          token: newDonation.data.token,
          points: newDonation.data.points,
          expiry: newDonation.data.expiry,
          sign: newDonation.data.sign,
          path: [],
          donationRoot: donationSignature.setting.merkle_tree_root,
          donationProof: proof,
          executionScheduledAfter: new Date(donationSignature.usage_date).getTime() / 1000,
        })

        //send notification to the user
        if (donationSignature.setting.deal) {
          this.notificationsService.create({
            user: donationSignature.setting.user.id,
            title: 'Recurring Donation Changed',
            message: `Your recurring donation for ${donationSignature.setting.deal.name} has been changed`,
            type: NotificationType.RECURRING_DONATION_CHANGED,
            receiver_type: NotificationReceiverType.USER,
            related_to: NotificationRelatedTo.DEAL,
            data: {
              id: donationSignature.setting.deal.id,
              name: donationSignature.setting.deal.name,
              deal_type: donationSignature.setting.deal.deal_type,
            },
          })
        }
      }

      //  3. Execute the recurring donation
      try {
        await this.smartContractService.executeRecurringDonation(recurringDonations)
      } catch (error) {
        //  3.1. Revert all recurring Donations
        for (const donationData of newDonationData) {
          await this.userDonationService.revertDonation(donationData.user, donationData.id)
        }
        console.error('Error executing recurring donations:', error)
        continue
      }

      //  4. Mark the recurring donations as consumed
      const uniquePaymentIds = recurringDonations.map((recurring) => recurring.paymentId)
      await this.recurringDonationSignaturesRepository.update(
        {
          unique_id: In(uniquePaymentIds),
        },
        {
          is_consumed: true,
        },
      )
    }
  }
}
