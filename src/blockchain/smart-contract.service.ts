import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NonprofitSettlement } from './interfaces/settlement.interface'
import { RecurringDonationInput } from './interfaces/recurring-donations.interface'
import { MVMNTManagerAbi, WithdrawManagerAbi, NPVFactoryAbi, NonprofitVaultAbi } from './abi'

@Injectable()
export class SmartContractService {
  private provider: ethers.Provider
  private WithdrawManagerContract: ethers.Contract
  private MVMNTManagerContract: ethers.Contract
  private NPVFactoryContract: ethers.Contract

  constructor(private readonly configService: ConfigService) {
    //  1. Load required Config Variables
    const rpcURL: string = this.configService.getOrThrow('blockchain.provider.rpcURL')
    const trustedEntityKey = this.configService.getOrThrow('blockchain.contract.trustedEntity.key')
    const withdrawManagerAddress = this.configService.getOrThrow(
      'blockchain.contract.withdrawManager.address',
    )
    const MVMNTManagerAddress = this.configService.getOrThrow(
      'blockchain.contract.mvmntManager.address',
    )
    const NPVFactoryAddress = this.configService.getOrThrow(
      'blockchain.contract.NPVFactory.address',
    )

    //  2. Initiate the Signer
    this.provider = new ethers.JsonRpcProvider(rpcURL)
    const signer = new ethers.Wallet(trustedEntityKey, this.provider)

    //  3. Initialize Contracts
    this.WithdrawManagerContract = new ethers.Contract(
      withdrawManagerAddress,
      WithdrawManagerAbi,
      signer,
    )
    this.MVMNTManagerContract = new ethers.Contract(MVMNTManagerAddress, MVMNTManagerAbi, signer)
    this.NPVFactoryContract = new ethers.Contract(NPVFactoryAddress, NPVFactoryAbi, signer)
  }

  async getUnsettledDonations(donationProject: string, tokenAddress: string): Promise<BigNumber> {
    try {
      const contract = new ethers.Contract(donationProject, NonprofitVaultAbi, this.provider)
      const result = await contract.unsettledDonations(tokenAddress)

      return BigNumber(ethers.formatEther(result.toString()))
    } catch (error) {
      console.error(`Error querying unsettled donations: ${error}`)
      throw error
    }
  }

  async getWithdrawableFunds(donationProject: string, tokenAddress: string): Promise<BigNumber> {
    try {
      const contract = new ethers.Contract(donationProject, NonprofitVaultAbi, this.provider)
      const result = await contract.withdrawableFunds(tokenAddress)

      return BigNumber(ethers.formatEther(result.toString()))
    } catch (error) {
      console.error(`Error querying withdrawable funds: ${error}`)
      throw error
    }
  }

  async settleDonationBatch(settlements: NonprofitSettlement[][], nonprofitVault: string[]) {
    try {
      const settlement = await this.WithdrawManagerContract.settleDonationBatch(
        settlements,
        nonprofitVault,
      )

      await settlement.wait()
      console.log('Batch donation settled', settlement.hash)
    } catch (error) {
      console.error(`Error settling donation batch: ${error}`)
      throw error
    }
  }

  async createNonprofitVault(uniqueProjectId: string, nonProfitAddress: string): Promise<any> {
    const transaction = await this.NPVFactoryContract.createNonprofitVault(
      uniqueProjectId,
      nonProfitAddress,
    )
    await transaction.wait()
    console.log('Nonprofit vault created:', transaction.hash)

    return transaction.hash
  }

  async executeRecurringDonation(recurringDonations: RecurringDonationInput[]) {
    const transaction = await this.MVMNTManagerContract.recurringDonation(recurringDonations)
    await transaction.wait()
    console.log('Recurring donations executed:', transaction.hash)
  }

  async cancelRecurringDonations(donors: string[], donationRoots: string[]) {
    try {
      const transaction = await this.MVMNTManagerContract.cancelRecurringDonations(
        donors,
        donationRoots,
      )
      await transaction.wait()
      console.log('Recurring donations cancelled by trusted entity:', transaction.hash)
    } catch (error) {
      console.error('Error cancelling recurring donations by trusted entity:', error)
      throw error
    }
  }

  async executeRefund(
    buyer: string,
    seller: string,
    token: string,
    amount: string,
    refundId: string,
    originTransactionId: string,
    expiry: number,
    signature: string,
    buyerPaysGasFee: boolean,
  ): Promise<string> {
    try {
      // Prepare transaction parameters
      const gasLimit = parseInt(
        this.configService.get<string>('blockchain.gasLimit.refund', '250000'),
      )
      const options = {
        gasLimit,
      }

      // Execute the refund transaction
      const transaction = await this.MVMNTManagerContract.processRefund(
        buyer,
        seller,
        token,
        amount,
        refundId,
        originTransactionId,
        expiry,
        signature,
        buyerPaysGasFee,
        options,
      )

      // Wait for the transaction to be mined
      const receipt = await transaction.wait()
      console.log('Refund transaction executed:', receipt.hash)

      return receipt.hash
    } catch (error) {
      console.error('Error executing refund transaction:', error)
      throw error
    }
  }
}
