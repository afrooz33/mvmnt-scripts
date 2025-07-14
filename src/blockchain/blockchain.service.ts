import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'
import { MerkleTree } from 'merkletreejs'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ErrorKey } from '@app/src/shared/enums'
import { createUniqueId } from '@app/src/users/payment/methods/uuid.methods'
import { bigNumberToString } from '@app/src/users/payment/methods/payment.methods'
// import { ReturnShippingFeeResponsibility } from '@app/src/purchase-history/refund-exchange/enums'
import {
  DealPayment,
  BuyNowCommon,
  BuyNowPayment,
  DonationEntries,
  BuyNowSignature,
  BuyNowCommonExpiry,
  UserWithdrawalData,
  RefundSignatureData,
  BuyNowPaymentEthers,
  DonationSignatureData,
  RecurringDonationDetails,
} from './interfaces'

@Injectable()
export class BlockchainService {
  private withdrawManagerDomain: object
  private userWithdrawType: Record<string, ethers.TypedDataField[]>
  private domain: object
  private buynowType: Record<string, ethers.TypedDataField[]>
  private paymentType: Record<string, ethers.TypedDataField[]>
  private donationType: Record<string, ethers.TypedDataField[]>
  private refundType: Record<string, ethers.TypedDataField[]>
  private adminWallet: ethers.Wallet
  private signatureExpiry: number
  private provider: ethers.Provider
  private PROOF_TYPE: string[]

  constructor(private readonly configService: ConfigService) {
    this.domain = {
      name: 'MVMNTManager',
      chainId: this.configService.get('blockchain.chainId'),
      verifyingContract: this.configService.get('blockchain.contract.mvmntManager.address'),
      version: this.configService.get('blockchain.contract.mvmntManager.version'),
    }

    this.withdrawManagerDomain = {
      name: 'WithdrawManager',
      chainId: this.configService.get('blockchain.chainId'),
      verifyingContract: this.configService.get('blockchain.contract.withdrawManager.address'),
      version: this.configService.get('blockchain.contract.withdrawManager.version'),
    }

    this.userWithdrawType = {
      Withdraw: [
        { name: 'user', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'withdrawId', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    }

    this.buynowType = {
      PaymentBatch: [
        { name: 'common', type: 'Common' },
        { name: 'payments', type: 'Payment[]' },
      ],
      Common: [
        { name: 'buyer', type: 'address' },
        { name: 'seller', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'expiry', type: 'uint256' },
      ],
      Payment: [
        { name: 'productId', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'quantity', type: 'uint256' },
        { name: 'adminShare', type: 'uint256' },
        { name: 'buyerPoints', type: 'uint256' },
        { name: 'sellerPoints', type: 'uint256' },
        { name: 'paymentId', type: 'uint256' },
        { name: 'donationAmount', type: 'uint256' },
        { name: 'nonprofitVault', type: 'address' },
      ],
    }

    this.paymentType = {
      Payment: [
        { name: 'productId', type: 'uint256' },
        { name: 'price', type: 'uint256' },
        { name: 'quantity', type: 'uint256' },
        { name: 'adminShare', type: 'uint256' },
        { name: 'buyer', type: 'address' },
        { name: 'buyerPoints', type: 'uint256' },
        { name: 'seller', type: 'address' },
        { name: 'sellerPoints', type: 'uint256' },
        { name: 'paymentId', type: 'uint256' },
        { name: 'token', type: 'address' },
        { name: 'donationAmount', type: 'uint256' },
        { name: 'nonprofitVault', type: 'address' },
        { name: 'expiry', type: 'uint256' },
      ],
    }

    this.donationType = {
      Donation: [
        { name: 'nonprofitVault', type: 'address' },
        { name: 'donor', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'points', type: 'uint256' },
        { name: 'paymentId', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    }

    this.refundType = {
      Refund: [
        { name: 'buyer', type: 'address' },
        { name: 'seller', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'refundId', type: 'uint256' },
        { name: 'originTransactionId', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
      ],
    }

    // ToDo: Get Admin Signature Key for secrets manager instead of .env
    const adminKey = this.configService.get('blockchain.adminKey')
    this.adminWallet = new ethers.Wallet(adminKey)
    this.signatureExpiry = this.configService.get<number>('blockchain.signatureExpiry') * 1000 * 60

    const rpcURL = this.configService.get('blockchain.provider.rpcURL')
    const network = {
      name: this.configService.get('blockchain.provider.network'),
      chainId: parseInt(this.configService.get('blockchain.chainId')),
    }

    this.provider = new ethers.JsonRpcProvider(rpcURL, network)
    this.PROOF_TYPE = ['address', 'address', 'address', 'address', 'uint256', 'uint256', 'uint256']
  }

  getGasFees = async (transactionHash: string): Promise<BigNumber> => {
    //  1. Get details of the Transaction
    const transaction = await this.provider.getTransactionReceipt(transactionHash)

    //  2. Convert the Gas Price and Gas Used to ETH
    const gasPrice: BigNumber = BigNumber(ethers.formatEther(transaction.gasPrice))
    const gasUsed: BigNumber = BigNumber(transaction.gasUsed.toString())

    return gasUsed.multipliedBy(gasPrice)
  }

  isTransactionReverted = async (transactionHash: string) => {
    //  1. Get details of the Transaction
    const transaction = await this.provider.getTransactionReceipt(transactionHash)
    if (!transaction) throw new Error('Invalid Transaction ID')

    return transaction.status === 0
  }

  signDonation = async (data: DonationSignatureData, precision: number) => {
    const donation: any = bigNumberToString({ ...data, expiry: this.getExpiry() }, precision)

    const sign = await this.adminWallet.signTypedData(this.domain, this.donationType, donation)

    return {
      sign,
      donation,
    }
  }

  signUserWithdrawal = async (data: UserWithdrawalData, precision: number) => {
    const withdrawal: any = bigNumberToString({ ...data, expiry: this.getExpiry() }, precision)

    const sign = await this.adminWallet.signTypedData(
      this.withdrawManagerDomain,
      this.userWithdrawType,
      withdrawal,
    )

    return {
      sign,
      withdrawal,
    }
  }

  signBuyNowPayments = async (
    payments: BuyNowPayment[],
    common: BuyNowCommon,
    precision: number,
  ): Promise<BuyNowSignature> => {
    //  1. Convert any BigNumber to string for each payment
    const paymentString: BuyNowPaymentEthers[] = []
    for (const payment of payments) {
      paymentString.push(bigNumberToString(payment, precision) as BuyNowPaymentEthers)
    }

    //  2. Sign the Payments and common data
    const commonData: BuyNowCommonExpiry = {
      ...common,
      expiry: this.getExpiry(),
    }

    const signature = await this.adminWallet.signTypedData(this.domain, this.buynowType, {
      payments: paymentString,
      common: commonData,
    })

    return {
      payments: paymentString,
      common: {
        ...commonData,
        sign: signature,
      },
    }
  }

  async signRefund(data: RefundSignatureData, precision: number) {
    const refund: any = bigNumberToString({ ...data, expiry: this.getExpiry() }, precision)

    const sign = await this.adminWallet.signTypedData(this.domain, this.refundType, refund)

    return {
      sign,
      refund,
    }
  }

  private getExpiry() {
    const expiry = new Date().getTime() + this.signatureExpiry
    return Math.floor(expiry / 1000)
  }

  private signDealPayment = async (payment: DealPayment, precision: number) => {
    //  1. Convert any BigNumber to string
    const paymentString: any = bigNumberToString(
      { ...payment, expiry: this.getExpiry() },
      precision,
    )

    //  2. Sign the Payment
    const sign = await this.adminWallet.signTypedData(this.domain, this.paymentType, paymentString)

    return {
      sign,
      payment: paymentString,
    }
  }

  signAuctionPayment = async (payment: DealPayment, precision: number) => {
    return await this.signDealPayment(payment, precision)
  }

  signRafflePayment = async (payment: DealPayment, precision: number) => {
    return await this.signDealPayment(payment, precision)
  }

  // async processRefund(params: {
  //   buyerId: string
  //   sellerId: string
  //   amount: number
  //   gasFeePayer: ReturnShippingFeeResponsibility
  //   returnExchangeId: string
  // }): Promise<string> {
  //   try {
  //     const { buyerId, sellerId, amount, gasFeePayer, returnExchangeId } = params

  //     // TODO: Get addresses from user repository or service
  //     // For this implementation, we'll generate addresses from the IDs
  //     const buyerAddress = ethers.getAddress(`0x${buyerId.substring(0, 40)}`)
  //     const sellerAddress = ethers.getAddress(`0x${sellerId.substring(0, 40)}`)

  //     // Native token address (ETH)
  //     const nativeTokenAddress = this.configService.get('blockchain.tokens.native')

  //     // Create refund signature data
  //     const refundData: RefundSignatureData = {
  //       buyer: buyerAddress,
  //       seller: sellerAddress,
  //       token: nativeTokenAddress,
  //       amount: new BigNumber(amount),
  //       refundId: new BigNumber(parseInt(returnExchangeId.replace(/-/g, ''), 16)),
  //       originTransactionId: new BigNumber(0), // If you have the original transaction ID, use it here
  //     }

  //     // Get the signature for the refund
  //     const { sign, refund } = await this.signRefund(refundData, 18)

  //     // Call the smart contract service to execute the refund
  //     // Note: In a real implementation, you would inject the SmartContractService
  //     // or call a method on an existing instance
  //     // const smartContractService = new SmartContractServiceMock()
  //     const txHash = await smartContractService.executeRefund(
  //       refund.buyer,
  //       refund.seller,
  //       refund.token,
  //       refund.amount,
  //       refund.refundId,
  //       refund.originTransactionId,
  //       refund.expiry,
  //       sign,
  //     //   gasFeePayer === ReturnShippingFeeResponsibility.BUYER,
  //     // )

  //     return txHash
  //   } catch (error) {
  //     throw new Error(`Failed to process refund: ${error.message}`)
  //   }
  // }

  getTreeRoot(tree: MerkleTree) {
    return ethers.hexlify(tree.getRoot())
  }

  generateTreeAndData(donationDetails: RecurringDonationDetails): {
    tree: MerkleTree
    donationEntries: DonationEntries[]
  } {
    //  1. Generate the Donation leaves
    const { leaves, donationEntries } = this.generateDonationLeavesAndData(donationDetails)

    //  2. Calculate the Merkle Tree
    const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true })

    //  3. Store proof for each donation
    for (const donation of donationEntries) {
      donation.proof = tree.getProof(donation.leafHash).map((x) => ethers.hexlify(x.data))
    }

    return { tree, donationEntries }
  }

  private generateDonationLeavesAndData(donationDetails: RecurringDonationDetails) {
    const donationEntries = []
    const leaves = []

    for (let monthOffset = 0; monthOffset < donationDetails.totalMonths; monthOffset++) {
      const scheduledExecution = donationDetails.executionScheduledAfter[monthOffset]
      const paymentId = createUniqueId(donationDetails.paymentIds[monthOffset])

      const convertedValue = bigNumberToString(
        { amount: donationDetails.amount },
        donationDetails.precision,
      )
      const leafHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(this.PROOF_TYPE, [
          donationDetails.donor,
          donationDetails.nonprofitVault,
          donationDetails.token,
          donationDetails.token,
          convertedValue.amount,
          scheduledExecution,
          paymentId,
        ]),
      )
      leaves.push(leafHash)

      donationEntries.push({
        donor: donationDetails.donor,
        nonprofitVault: donationDetails.nonprofitVault,
        token: donationDetails.token,
        paymentToken: donationDetails.token,
        amount: donationDetails.amount,
        scheduledExecution: scheduledExecution,
        paymentId: paymentId,
        leafHash,
      })
    }

    return {
      leaves,
      donationEntries,
    }
  }

  isWalletSignatureValid(signature: string, address: string, message: string): boolean {
    if (!ethers.isAddress(address)) {
      throw new Error(ErrorKey.INVALID_ETHEREUM_ADDRESS)
    }

    const expectedAddress = address.toLowerCase()
    const recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase()

    return recoveredAddress === expectedAddress
  }

  // New methods for governance, staking, and pool management
  getProvider(): ethers.Provider {
    return this.provider
  }

  getSigner(): ethers.Wallet {
    return this.adminWallet
  }

  async getHealthStatus(): Promise<{ isHealthy: boolean; details: string }> {
    try {
      // Test provider connection
      await this.provider.getNetwork()

      // Test wallet connection
      const balance = await this.provider.getBalance(this.adminWallet.address)

      return {
        isHealthy: true,
        details: `Provider connected, wallet balance: ${ethers.formatEther(balance)} ETH`,
      }
    } catch (error) {
      return {
        isHealthy: false,
        details: `Health check failed: ${error.message}`,
      }
    }
  }

  async reconnect(): Promise<boolean> {
    try {
      const rpcURL = this.configService.get('blockchain.provider.rpcURL')
      const network = {
        name: this.configService.get('blockchain.provider.network'),
        chainId: parseInt(this.configService.get('blockchain.chainId')),
      }

      this.provider = new ethers.JsonRpcProvider(rpcURL, network)

      // Test the new connection
      await this.provider.getNetwork()

      return true
    } catch (error) {
      return false
    }
  }

  async ensureInitialized(): Promise<void> {
    try {
      await this.provider.getNetwork()
    } catch (error) {
      throw new Error(`Blockchain service not properly initialized: ${error.message}`)
    }
  }
}
