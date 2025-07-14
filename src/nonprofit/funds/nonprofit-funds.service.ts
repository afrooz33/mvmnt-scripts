import BigNumber from 'bignumber.js'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, In, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { DONATION_STATUS } from '@app/src/donations/enums'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { SmartContractService } from '@app/src/blockchain/smart-contract.service'
import { bigNumberToString } from '@app/src/users/payment/methods/payment.methods'
import { UserDonationsEntity } from '@app/src/donations/entities/donations.entity'
import { NonprofitSettlement } from '@app/src/blockchain/interfaces/settlement.interface'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import { NonprofitFundsDto } from './dto'
import { NonprofitFundsEntity } from './entities/nonprofit-funds.entity'
import { DonationDetails } from './interface/donation-details.interface'

@Injectable()
export class NonprofitFundsService {
  private pageSize: number
  private projectsToProcess: number

  constructor(
    @InjectRepository(NonprofitFundsEntity)
    private readonly nonprofitFundsRepository: Repository<NonprofitFundsEntity>,
    @InjectRepository(DonationProjectEntity)
    private readonly donationProjectRepository: Repository<DonationProjectEntity>,
    @InjectRepository(UserDonationsEntity)
    private readonly userDonationsRepository: Repository<UserDonationsEntity>,
    private readonly tokensService: TokensService,
    private readonly smartContractService: SmartContractService,
    private readonly configService: ConfigService,
    private readonly entityManager: EntityManager,
  ) {
    this.pageSize = 1000
    const batchSize = parseInt(
      this.configService.get('blockchain.contract.withdrawManager.batchSize'),
    )
    this.projectsToProcess = batchSize
  }

  async fundsReceived(payload: NonprofitFundsDto): Promise<SuccessRO> {
    //  1. Get latest balance from the SC
    const balance: BigNumber = await this.smartContractService.getUnsettledDonations(
      payload.donation_project,
      payload.token,
    )

    //  2. Get Token and donation project information
    const token: TokenWhitelistEntity = await this.tokensService.getTokenInfo(
      payload.token.toLowerCase(),
    )
    const donationProject = await this.donationProjectRepository.findOne({
      where: {
        vault_address: payload.donation_project.toLowerCase(),
      },
    })
    if (!donationProject) throw new NotFoundException(ErrorKey.DONATION_PROJECT_NOT_FOUND)
    if (!token) throw new NotFoundException(ErrorKey.CURRENCY_NOT_FOUND)

    //  3. Update the Donation Project Balance
    const existingFunds = await this.nonprofitFundsRepository.findOne({
      where: {
        donation_project: {
          id: donationProject.id,
        },
      },
    })
    if (existingFunds) {
      existingFunds.unsettled_funds = balance
      await existingFunds.save()
    } else {
      const nonprofitFunds = this.nonprofitFundsRepository.create({
        currency: token,
        donation_project: donationProject,
        unsettled_funds: balance,
        withdrawable_funds: BigNumber(0),
      })
      await nonprofitFunds.save()
    }

    return {
      data: payload,
      message: 'Donation Project Balance updated',
      success: true,
    }
  }

  async fundsWithdrawn(payload: NonprofitFundsDto): Promise<SuccessRO> {
    //  1. Get latest balance from the SC
    const balance: BigNumber = await this.smartContractService.getWithdrawableFunds(
      payload.donation_project,
      payload.token,
    )

    //  2. Get Token and donation project information
    const token: TokenWhitelistEntity = await this.tokensService.getTokenInfo(payload.token)
    const donationProject = await this.donationProjectRepository.findOne({
      where: {
        vault_address: payload.donation_project.toLowerCase(),
      },
    })
    if (!donationProject) throw new NotFoundException(ErrorKey.DONATION_PROJECT_NOT_FOUND)
    if (!token) throw new NotFoundException(ErrorKey.CURRENCY_NOT_FOUND)

    await this.nonprofitFundsRepository.update(
      {
        currency: token,
        donation_project: donationProject,
      },
      {
        withdrawable_funds: balance,
      },
    )

    return {
      data: payload,
      message: 'Donation Project Balance updated',
      success: true,
    }
  }

  async fundsSettled(payload: NonprofitFundsDto): Promise<SuccessRO> {
    //  1. Get latest balance from the SC
    const unsettledFunds: BigNumber = await this.smartContractService.getUnsettledDonations(
      payload.donation_project,
      payload.token,
    )
    const withdrawableFunds: BigNumber = await this.smartContractService.getWithdrawableFunds(
      payload.donation_project,
      payload.token,
    )

    //  2. Get Token and donation project information
    const token: TokenWhitelistEntity = await this.tokensService.getTokenInfo(payload.token)
    const donationProject = await this.donationProjectRepository.findOne({
      where: {
        vault_address: payload.donation_project,
      },
    })
    if (!donationProject) throw new NotFoundException(ErrorKey.DONATION_PROJECT_NOT_FOUND)
    if (!token) throw new NotFoundException(ErrorKey.CURRENCY_NOT_FOUND)

    //  3. Update both the balances
    await this.nonprofitFundsRepository.upsert(
      {
        currency: token,
        donation_project: donationProject,
        unsettled_funds: unsettledFunds,
        withdrawable_funds: withdrawableFunds,
      },
      { conflictPaths: ['currency', 'donation_project'] },
    )

    //  4. Update status of donations for donation project
    await this.updateDonationStatus([donationProject.id])

    return {
      data: payload,
      message: 'Donation Project Balance updated',
      success: true,
    }
  }

  async settleFunds() {
    //  1. Count the total no. of Donation Projects that received donations in last month
    const totalProjects = await this.getActiveProjectCount()

    //  2. Process 1000 donation project Ids at a time
    for (let pageNo = 0; pageNo <= totalProjects.count / this.pageSize; pageNo += 1) {
      //  2.1. Get Ids of donation projects that received donation in the last month
      const donationProjectIds = await this.getDonationProjectIds(pageNo, this.pageSize)

      //  2.2. Process all the project IDs in Batch
      for (let i = 0; i <= donationProjectIds.length / this.projectsToProcess; i += 1) {
        //  2.2.1. Select projects to process
        const idsToProcess = donationProjectIds.splice(-this.projectsToProcess)
        if (idsToProcess.length === 0) break

        //  2.2.2. Get all Donations for the projects
        const donations: DonationDetails[] = await this.getAllDonations(idsToProcess)

        // 2.2.3. Prepare objects for operations
        const { nonprofitDonations, nonprofitAddress } = await this.prepareOperations(donations)

        await this.entityManager.transaction(async (transaction) => {
          //  2.2.4. Mark donations as settled
          const donationIds = donations.map((donation) => donation.id)
          await transaction.update(
            UserDonationsEntity,
            {
              id: In(donationIds),
            },
            {
              status: DONATION_STATUS.SETTLED,
            },
          )

          // 2.2.5. Call Smart Contract
          try {
            await this.smartContractService.settleDonationBatch(
              nonprofitDonations,
              nonprofitAddress,
            )
          } catch (err) {
            // ToDo: How to handle SC failures?
            //  One is to restart the CRON as it will handle everything
            console.error(`Error in Smart Contract Call ${err}`)
            throw err
          }
        })
      }
    }
  }

  async updateDonationStatus(donationProjectIds: string[]) {
    await this.userDonationsRepository
      .createQueryBuilder()
      .update(UserDonationsEntity)
      .set({ status: DONATION_STATUS.SETTLED, settlement_date: new Date() })
      .where('donation_project IN (:...ids)', { ids: donationProjectIds })
      .andWhere("created >= NOW() - INTERVAL '30 days'")
      .andWhere(`status = '${DONATION_STATUS.COMPLETED}'`)
      .execute()
  }

  async prepareOperations(donations: DonationDetails[]) {
    const nonprofitAddress: string[] = []
    const nonprofitDonations: NonprofitSettlement[][] = []

    let settlements: NonprofitSettlement[] = []
    let currentAddress: string
    const tokens = {}

    for (const donation of donations) {
      if (currentAddress != donation.vault_address) {
        //  1. Update the nonprofit address and current address
        nonprofitAddress.push(donation.vault_address)
        currentAddress = donation.vault_address

        //  2. Push existing settlements (if any), and clear the settlements
        if (settlements.length > 0) nonprofitDonations.push(settlements)
        settlements = []
      }

      if (!tokens[donation.currency])
        tokens[donation.currency] = await this.tokensService.getTokenInfo(donation.currency)

      const settlement = {
        token: donation.currency,
        adminShare: donation.adminShare,
        nonprofitWithdrawableFunds: donation.amount.minus(donation.adminShare),
      }

      settlements.push(bigNumberToString(settlement, tokens[donation.currency].decimals))
    }

    nonprofitDonations.push(settlements)

    return {
      nonprofitAddress: nonprofitAddress,
      nonprofitDonations: nonprofitDonations,
    }
  }

  calculateNonprofitGAS = (dealGasFees: BigNumber, donationGasFees: BigNumber) => {
    return {
      dealGasFees: dealGasFees.dividedBy(3),
      donationGasFees: donationGasFees.dividedBy(2),
    }
  }

  async getDonationProjectIds(pageNo: number, pageSize: number) {
    const donationProjectList = await this.userDonationsRepository
      .createQueryBuilder('donations')
      .select('donations.donation_project', 'donationProject')
      .distinct(true)
      .where("donations.created >= NOW() - INTERVAL '30 days'")
      .andWhere(`donations.status = '${DONATION_STATUS.COMPLETED}'`)
      .orderBy('donations.donation_project')
      .skip(pageSize * pageNo)
      .take(pageSize)
      .getRawMany()

    return donationProjectList.map((item) => item.donationProject)
  }

  async getActiveProjectCount() {
    return await this.userDonationsRepository
      .createQueryBuilder('donations')
      .select('COUNT(DISTINCT donations.donation_project)', 'count')
      .where("donations.created >= NOW() - INTERVAL '30 days'")
      .andWhere(`donations.status = '${DONATION_STATUS.COMPLETED}'`)
      .getRawOne()
  }

  async getAllDonations(idsToProcess: string[]): Promise<DonationDetails[]> {
    const output = await this.userDonationsRepository
      .createQueryBuilder('donations')
      .select([
        'donations.id AS id',
        'donations.donation_project AS project',
        'project.vault_address AS vault_address',
        'currency.address AS currency',
        'SUM(donations.admin_share) as adminShare',
        'SUM(donations.unsettled_amount) AS amount',
      ])

      .innerJoin('donations.donation_project', 'project')
      .innerJoin('donations.payment_currency', 'currency')

      .where('donations.donation_project IN (:...ids)', { ids: idsToProcess })
      .andWhere("donations.created >= NOW() - INTERVAL '30 days'")
      .andWhere('donations.unsettled_amount > 0')
      .andWhere(`donations.status = '${DONATION_STATUS.COMPLETED}'`)

      .orderBy('donations.donation_project')

      .groupBy('donations.donation_project')
      .addGroupBy('project.vault_address')
      .addGroupBy('currency.address')
      .addGroupBy('donations.id')
      .getRawMany()

    return output
  }
}
