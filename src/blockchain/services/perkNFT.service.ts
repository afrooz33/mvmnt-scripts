import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers } from 'ethers'
import { perkNFTAbi } from '../abi/perkNFT.abi'
import { SmartContractService } from '../smart-contract.service'
import {
  MintPerkNFTDto,
  TransferPerkNFTDto,
  BatchBalanceDto,
  UpdateBaseURIDto,
  UpdatePerkManagerDto,
  FullPerkInfo,
  MintPerkResponse,
  BurnPerkResponse,
  UsePerkResponse,
  TransferPerkResponse,
  UsePerkDto,
} from '../interfaces/perkNFT.interfaces'

@Injectable()
export class PerkNFTService {
  private readonly logger = new Logger(PerkNFTService.name)
  private contract: ethers.Contract
  private contractAddress: string
  private provider: ethers.Provider
  private signer: ethers.Wallet

  constructor(
    private readonly configService: ConfigService,
    private readonly smartContractService: SmartContractService,
  ) {
    this.initializeContract()
  }

  private async initializeContract() {
    try {
      const rpcURL = this.configService.get<string>('blockchain.provider.rpcURL')
      const perkNFTAddress = this.configService.get<string>('blockchain.contract.perkNFT.address')
      const adminKey = this.configService.get<string>('blockchain.adminKey')

      this.logger.log('=== PerkNFT Configuration Debug ===')
      this.logger.log(`RPC URL: ${rpcURL}`)
      this.logger.log(`PerkNFT Address: ${perkNFTAddress}`)
      this.logger.log(`Admin Key exists: ${!!adminKey}`)

      if (!rpcURL) {
        throw new Error('BLOCKCHAIN_PROVIDER_RPCURL environment variable is not set')
      }

      if (!perkNFTAddress || perkNFTAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('PERK_NFT_ADDRESS environment variable is not set or is zero address')
      }

      if (!adminKey) {
        throw new Error('ADMIN_KEY environment variable is not set')
      }

      this.provider = new ethers.JsonRpcProvider(rpcURL)
      this.signer = new ethers.Wallet(adminKey, this.provider)
      this.contract = new ethers.Contract(perkNFTAddress, perkNFTAbi, this.signer)
      this.contractAddress = perkNFTAddress

      // Test connection
      const network = await this.provider.getNetwork()
      this.logger.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`)

      this.logger.log('PerkNFT contract initialized successfully')
      this.logger.log(`Contract Address: ${perkNFTAddress}`)
      this.logger.log(`Signer Address: ${await this.signer.getAddress()}`)
    } catch (error) {
      this.logger.error('Failed to initialize PerkNFT contract:', error.message || error)
      throw error
    }
  }

  /**
   * Mint a new perk NFT
   */
  async mintPerk(mintDto: MintPerkNFTDto): Promise<MintPerkResponse> {
    try {
      this.logger.log(`Minting perk NFT for brand: ${mintDto.brandId}, perk: ${mintDto.perkId}`)

      // Check if contract is initialized
      if (!this.contract) {
        throw new Error('Contract not initialized. Please check environment variables.')
      }

      // Log contract connection status
      this.logger.log(`Contract address: ${await this.contract.getAddress()}`)
      this.logger.log(`Signer address: ${await this.signer.getAddress()}`)

      // Check if contract has required function
      try {
        await this.contract.perkManager()
        this.logger.log('Contract connection verified - perkManager function accessible')
      } catch (contractError) {
        this.logger.error(`Contract function test failed: ${contractError.message}`)
        throw new Error(`Contract not accessible: ${contractError.message}`)
      }

      const perkData = {
        perkType: mintDto.perkType,
        discountType: mintDto.discountType,
        discountAmount: ethers.parseUnits(mintDto.discountAmount, 18),
        discountPercent: ethers.parseUnits(mintDto.discountPercent, 18),
        usageLimit: mintDto.usageLimit,
        maxUses: BigInt(mintDto.maxUses),
        duration: BigInt(mintDto.duration),
        isTransferable: mintDto.isTransferable,
        name: mintDto.name,
        description: mintDto.description,
        tokenURI: mintDto.tokenURI,
      }

      // Log perk data with BigInt values converted to strings for display
      this.logger.log('Perk data prepared:', {
        perkType: perkData.perkType,
        discountType: perkData.discountType,
        discountAmount: perkData.discountAmount.toString(),
        discountPercent: perkData.discountPercent.toString(),
        usageLimit: perkData.usageLimit,
        maxUses: perkData.maxUses.toString(),
        duration: perkData.duration.toString(),
        isTransferable: perkData.isTransferable,
        name: perkData.name,
        description: perkData.description,
        tokenURI: perkData.tokenURI,
      })

      this.logger.log(
        `Calling mintPerk with brandId: ${mintDto.brandId}, perkId: ${mintDto.perkId}, recipient: ${mintDto.recipient}`,
      )

      // Check if current signer is authorized
      const currentPerkManager = await this.contract.perkManager()
      const signerAddress = await this.signer.getAddress()

      this.logger.log(`Current perk manager: ${currentPerkManager}`)
      this.logger.log(`Current signer: ${signerAddress}`)

      if (currentPerkManager.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(
          `Unauthorized: Current signer (${signerAddress}) is not the perk manager (${currentPerkManager}). Only the perk manager can mint NFTs.`,
        )
      }

      const tx = await this.contract.mintPerk(
        ethers.parseUnits(mintDto.brandId, 18),
        ethers.parseUnits(mintDto.perkId, 18),
        mintDto.recipient,
        perkData,
      )

      const receipt = await tx.wait()
      this.logger.log(`Perk NFT minted successfully. Transaction hash: ${receipt.hash}`)

      // Extract token ID from transaction logs
      let mintedTokenId = null

      this.logger.log(`Parsing ${receipt.logs.length} transaction logs for token ID...`)

      // Look for PerkNFTMinted event in logs
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log)
          if (parsedLog && parsedLog.name === 'PerkNFTMinted') {
            mintedTokenId = parsedLog.args.tokenId.toString()
            this.logger.log(`✅ Token ID extracted from event: ${mintedTokenId}`)
            break
          }
        } catch (parseError) {
          // Skip logs that can't be parsed by this contract
          continue
        }
      }

      // If token ID not found in events, calculate it using the contract function
      if (!mintedTokenId) {
        this.logger.log('Token ID not found in events, calculating...')
        try {
          const calculatedTokenId = await this.contract.getTokenIdForPerk(
            ethers.parseUnits(mintDto.brandId, 18),
            ethers.parseUnits(mintDto.perkId, 18),
          )
          mintedTokenId = calculatedTokenId.toString()
          this.logger.log(`✅ Token ID calculated: ${mintedTokenId}`)
        } catch (calcError) {
          this.logger.warn(`❌ Could not calculate token ID: ${calcError.message}`)
          // Set a fallback message
          mintedTokenId = 'Check logs or use getTokenIdForPerk API'
        }
      }

      return {
        success: true,
        tokenId: mintedTokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        brandId: mintDto.brandId,
        perkId: mintDto.perkId,
        recipient: mintDto.recipient,
      }
    } catch (error) {
      this.logger.error(`Failed to mint perk NFT: ${error.message || error}`)
      this.logger.error('Full error:', error)
      throw new Error(`Failed to mint perk NFT: ${error.message || 'Unknown error occurred'}`)
    }
  }

  /**
   * Burn a perk NFT
   */
  async burnPerk(tokenId: string): Promise<BurnPerkResponse> {
    try {
      this.logger.log(`Burning perk NFT with tokenId: ${tokenId}`)

      const tx = await this.contract.burnPerk(BigInt(tokenId))
      const receipt = await tx.wait()

      this.logger.log(`Perk NFT burned successfully. Transaction hash: ${receipt.hash}`)

      return {
        success: true,
        tokenId: tokenId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        action: 'burned',
      }
    } catch (error) {
      this.logger.error(`Failed to burn perk NFT: ${error.message}`)
      throw new Error(`Failed to burn perk NFT: ${error.message}`)
    }
  }

  /**
   * Use a perk NFT
   * @param tokenId The token ID to use
   * @param userWallet The wallet address of the user using the perk
   * @returns Raw response from smart contract
   */
  async usePerk(tokenId: string, useDto: UsePerkDto): Promise<any> {
    try {
      const numericTokenId = Number(tokenId)
      this.logger.log(
        `Attempting to use perk NFT with tokenId: ${numericTokenId} for user: ${useDto.userWallet}`,
      )

      // Check contract state
      this.logger.log(`Contract Address: ${this.contractAddress}`)
      const isPaused = await this.contract.paused()
      this.logger.log(`Contract Paused: ${isPaused}`)

      if (isPaused) {
        return {
          success: false,
          error: 'Contract is paused',
          code: 'CONTRACT_PAUSED',
        }
      }

      // Check user balance first
      const balance = await this.contract.balanceOf(useDto.userWallet, numericTokenId)
      this.logger.log(`User Balance: ${balance}`)

      if (balance.toString() === '0') {
        return {
          success: false,
          error: 'User does not own this perk NFT',
          code: 'NOT_OWNER',
        }
      }

      // Get perk info to validate
      const perkInfo = await this.contract.getPerkInfo(numericTokenId)
      this.logger.log(
        'Raw perkInfo from contract:',
        JSON.stringify(perkInfo, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      )

      // Check expiration
      const currentTime = Math.floor(Date.now() / 1000)
      const expirationTime = Number(perkInfo.core?.expirationTime || 0)
      this.logger.log(`Current time: ${currentTime}, Expiration: ${expirationTime}`)

      if (expirationTime < currentTime && expirationTime > 0) {
        return {
          success: false,
          error: 'Perk has expired',
          code: 'PERK_EXPIRED',
        }
      }

      // Check usage limits
      const maxUses = Number(perkInfo.details?.maxUses || 0)
      const usedCount = Number(perkInfo.details?.usedCount || 0)

      if (maxUses > 0 && usedCount >= maxUses) {
        return {
          success: false,
          error: 'Perk has reached maximum uses',
          code: 'MAX_USES_REACHED',
        }
      }

      // ⚠️ CRITICAL CHANGE: This function should be called by user's wallet, not admin
      // For now, we'll simulate the call to check if it would work

      // Estimate gas first to check for potential failures
      try {
        await this.contract.usePerk.staticCall(numericTokenId)
        this.logger.log('Static call successful - transaction should work')
      } catch (staticError) {
        this.logger.error('Static call failed:', staticError.message)

        // Check specific error cases
        if (staticError.message.includes('NotOwnerOrApproved')) {
          return {
            success: false,
            error: 'Admin wallet cannot use user-owned perk. This should be called by user wallet.',
            code: 'AUTHORIZATION_ERROR',
            suggestion:
              'User should call this function directly with their wallet, or implement proper wallet delegation.',
          }
        }

        if (staticError.message.includes('PerkExpired')) {
          return {
            success: false,
            error: 'Perk has expired',
            code: 'PERK_EXPIRED',
          }
        }

        if (staticError.message.includes('MaxUsesReached')) {
          return {
            success: false,
            error: 'Perk has reached maximum uses',
            code: 'MAX_USES_REACHED',
          }
        }

        return {
          success: false,
          error: 'Transaction would fail: ' + staticError.message,
          code: 'STATIC_CALL_FAILED',
        }
      }

      // If we reach here, the static call passed but actual transaction will still fail
      // because admin wallet is not the owner
      return {
        success: false,
        error: 'Cannot execute: Admin wallet cannot use user-owned perk',
        code: 'WALLET_MISMATCH',
        message: 'This perk belongs to user wallet and should be used by the user directly',
        userWallet: useDto.userWallet,
        adminWallet: await this.signer.getAddress(),
        solution: 'Implement user wallet integration or proper delegation mechanism',
      }
    } catch (error) {
      this.logger.error('Smart contract error:', error)

      // Handle specific error types
      if (error.code === 'CALL_EXCEPTION') {
        return {
          success: false,
          error: error.message,
          code: error.code,
          reason:
            'Transaction reverted by smart contract - likely authorization or validation failure',
        }
      }

      if (error.code === 'INSUFFICIENT_FUNDS') {
        return {
          success: false,
          error: error.message,
          code: error.code,
          reason: 'Insufficient funds for gas',
        }
      }

      return {
        success: false,
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      }
    }
  }

  /**
   * Transfer perk NFT
   */
  async safeTransferFrom(transferDto: TransferPerkNFTDto): Promise<TransferPerkResponse> {
    try {
      this.logger.log(
        `Transferring perk NFT tokenId: ${transferDto.tokenId} from ${transferDto.from} to ${transferDto.to}`,
      )

      const tx = await this.contract.safeTransferFrom(
        transferDto.from,
        transferDto.to,
        BigInt(transferDto.tokenId),
        BigInt(transferDto.amount),
        transferDto.data || '0x',
      )

      const receipt = await tx.wait()
      this.logger.log(`Perk NFT transferred successfully. Transaction hash: ${receipt.hash}`)

      return {
        success: true,
        tokenId: transferDto.tokenId,
        from: transferDto.from,
        to: transferDto.to,
        amount: transferDto.amount,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        action: 'transferred',
      }
    } catch (error) {
      this.logger.error(`Failed to transfer perk NFT: ${error.message}`)
      throw new Error(`Failed to transfer perk NFT: ${error.message}`)
    }
  }

  /**
   * Set approval for all
   */
  async setApprovalForAll(operator: string, approved: boolean): Promise<any> {
    try {
      this.logger.log(`Setting approval for operator: ${operator}, approved: ${approved}`)

      // Get the caller's address
      const callerAddress = await this.signer.getAddress()
      this.logger.log(`Caller address: ${callerAddress}`)

      // Set approval for the operator
      const tx = await this.contract.setApprovalForAll(operator, approved)
      this.logger.log(`Approval transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Approval transaction confirmed in block ${receipt.blockNumber}`)

      return {
        success: true,
        data: {
          operator,
          approved,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
        message: 'Approval set successfully',
      }
    } catch (error) {
      this.logger.error(`Failed to set approval: ${error.message}`)
      this.logger.error(`Full error:`, error)
      throw new Error(`Failed to set approval: ${error.message}`)
    }
  }

  /**
   * Check if operator is approved for all
   */
  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    try {
      const isApproved = await this.contract.isApprovedForAll(owner, operator)
      return isApproved
    } catch (error) {
      this.logger.error(`Failed to check approval: ${error.message}`)
      throw new Error(`Failed to check approval: ${error.message}`)
    }
  }

  /**
   * Get perk info by token ID
   */
  async getPerkInfo(tokenId: string): Promise<FullPerkInfo> {
    try {
      const perkInfo = await this.contract.getPerkInfo(BigInt(tokenId))
      this.logger.log(
        'Raw perkInfo from contract:',
        JSON.stringify(perkInfo, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      )
      // Defensive: log and check expirationTime
      const rawExpiration = perkInfo.core?.expirationTime
      this.logger.log('Raw expirationTime from contract:', rawExpiration)
      let expirationTimeISO = 'Invalid'
      if (rawExpiration && !isNaN(Number(rawExpiration)) && Number(rawExpiration) > 0) {
        try {
          expirationTimeISO = new Date(Number(rawExpiration) * 1000).toISOString()
        } catch (e) {
          this.logger.error('Error converting expirationTime to Date:', e)
        }
      } else {
        this.logger.error('Invalid expirationTime value:', rawExpiration)
      }
      // Convert BigInt values to strings for display, with undefined checks
      const brandId =
        perkInfo.core?.brandId !== undefined
          ? (perkInfo.core.brandId / BigInt(10 ** 18)).toString()
          : ''
      const perkId =
        perkInfo.core?.perkId !== undefined
          ? (perkInfo.core.perkId / BigInt(10 ** 18)).toString()
          : ''
      const response: FullPerkInfo = {
        core: {
          brandId,
          perkId,
          expirationTime: expirationTimeISO,
          usageLimit:
            perkInfo.core?.usageLimit !== undefined ? Number(perkInfo.core.usageLimit) : 0,
          isTransferable: Boolean(perkInfo.core?.isTransferable),
        },
        details: {
          discountAmount:
            perkInfo.details?.discountAmount !== undefined
              ? (perkInfo.details.discountAmount / BigInt(10 ** 18)).toString()
              : '',
          discountPercent:
            perkInfo.details?.discountPercent !== undefined
              ? (perkInfo.details.discountPercent / BigInt(10 ** 18)).toString()
              : '',
          maxUses:
            perkInfo.details?.maxUses !== undefined ? perkInfo.details.maxUses.toString() : '',
          usedCount:
            perkInfo.details?.usedCount !== undefined ? perkInfo.details.usedCount.toString() : '',
          duration:
            perkInfo.details?.duration !== undefined ? perkInfo.details.duration.toString() : '',
          name: perkInfo.details?.name || '',
          description: perkInfo.details?.description || '',
          tokenURI: perkInfo.details?.tokenURI || '',
        },
      }
      return response
    } catch (error) {
      this.logger.error(`Failed to get perk info: ${error.message}`)
      throw new Error(`Failed to get perk info: ${error.message}`)
    }
  }

  /**
   * Get remaining uses for a perk
   */
  async getRemainingUses(tokenId: string): Promise<string> {
    try {
      const remainingUses = await this.contract.getRemainingUses(BigInt(tokenId))
      return remainingUses.toString()
    } catch (error) {
      this.logger.error(`Failed to get remaining uses: ${error.message}`)
      throw new Error(`Failed to get remaining uses: ${error.message}`)
    }
  }

  /**
   * Check if perk is valid
   */
  async isPerkValid(tokenId: string, userWallet: string): Promise<boolean> {
    try {
      const numericTokenId = Number(tokenId)

      // Check if contract is paused
      const isPaused = await this.contract.paused()
      if (isPaused) {
        this.logger.log('Contract is paused')
        return false
      }

      // Check user balance
      const balance = await this.contract.balanceOf(userWallet, numericTokenId)
      if (balance.toString() === '0') {
        this.logger.log('User does not own the token')
        return false
      }

      // Get perk info
      const perkInfo = await this.contract.getPerkInfo(numericTokenId)

      // Check if perk exists
      if (!perkInfo.active) {
        this.logger.log('Perk is not active')
        return false
      }

      // Check expiration
      const currentTime = Math.floor(Date.now() / 1000)
      if (Number(perkInfo.expiresAt) < currentTime) {
        this.logger.log('Perk has expired')
        return false
      }

      // Check usage limits
      if (
        perkInfo.maxUses.toString() !== '0' &&
        Number(perkInfo.usedCount) >= Number(perkInfo.maxUses)
      ) {
        this.logger.log('Perk has reached maximum uses')
        return false
      }

      return true
    } catch (error) {
      this.logger.error(`Error checking perk validity: ${error.message}`)
      return false
    }
  }

  /**
   * Get token URI
   */
  async getTokenURI(tokenId: string): Promise<string> {
    try {
      const uri = await this.contract.uri(BigInt(tokenId))
      return uri
    } catch (error) {
      this.logger.error(`Failed to get token URI: ${error.message}`)
      throw new Error(`Failed to get token URI: ${error.message}`)
    }
  }

  /**
   * Get balance of address for token
   */
  async balanceOf(address: string, tokenId: string): Promise<string> {
    try {
      const balance = await this.contract.balanceOf(address, BigInt(tokenId))
      return balance.toString()
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`)
      throw new Error(`Failed to get balance: ${error.message}`)
    }
  }

  /**
   * Get batch balances
   */
  async balanceOfBatch(batchDto: BatchBalanceDto): Promise<string[]> {
    try {
      const tokenIds = batchDto.tokenIds.map((id) => BigInt(id))
      const balances = await this.contract.balanceOfBatch(batchDto.accounts, tokenIds)
      return balances.map((balance: any) => balance.toString())
    } catch (error) {
      this.logger.error(`Failed to get batch balances: ${error.message}`)
      throw new Error(`Failed to get batch balances: ${error.message}`)
    }
  }

  /**
   * Check if user has claimed perk
   */
  async hasClaimedPerk(perkId: string, userAddress: string): Promise<boolean> {
    try {
      const hasClaimed = await this.contract.hasClaimedPerk(
        ethers.parseUnits(perkId, 18),
        userAddress,
      )
      return hasClaimed
    } catch (error) {
      this.logger.error(`Failed to check claimed status: ${error.message}`)
      throw new Error(`Failed to check claimed status: ${error.message}`)
    }
  }

  /**
   * Get token ID for perk
   */
  async getTokenIdForPerk(brandId: string, perkId: string): Promise<string> {
    try {
      const tokenId = await this.contract.getTokenIdForPerk(
        ethers.parseUnits(brandId, 18),
        ethers.parseUnits(perkId, 18),
      )
      return tokenId.toString()
    } catch (error) {
      this.logger.error(`Failed to get token ID for perk: ${error.message}`)
      throw new Error(`Failed to get token ID for perk: ${error.message}`)
    }
  }

  /**
   * Update base URI (Admin only)
   */
  async setBaseURI(baseURIDto: UpdateBaseURIDto): Promise<any> {
    try {
      this.logger.log(`Updating base URI to: ${baseURIDto.baseURI}`)

      const tx = await this.contract.setBaseURI(baseURIDto.baseURI)
      const receipt = await tx.wait()

      this.logger.log(`Base URI updated successfully. Transaction hash: ${receipt.hash}`)

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      }
    } catch (error) {
      this.logger.error(`Failed to update base URI: ${error.message}`)
      throw new Error(`Failed to update base URI: ${error.message}`)
    }
  }

  /**
   * Update perk manager (Admin only)
   */
  async setPerkManager(perkManagerDto: UpdatePerkManagerDto): Promise<any> {
    try {
      this.logger.log(`Updating perk manager to: ${perkManagerDto.perkManager}`)

      const tx = await this.contract.setPerkManager(perkManagerDto.perkManager)
      const receipt = await tx.wait()

      this.logger.log(`Perk manager updated successfully. Transaction hash: ${receipt.hash}`)

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      }
    } catch (error) {
      this.logger.error(`Failed to update perk manager: ${error.message}`)
      throw new Error(`Failed to update perk manager: ${error.message}`)
    }
  }

  /**
   * Pause contract (Admin only)
   */
  async pauseContract(): Promise<any> {
    try {
      this.logger.log('Pausing PerkNFT contract')

      const tx = await this.contract.pause()
      const receipt = await tx.wait()

      this.logger.log(`Contract paused successfully. Transaction hash: ${receipt.hash}`)

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      }
    } catch (error) {
      this.logger.error(`Failed to pause contract: ${error.message}`)
      throw new Error(`Failed to pause contract: ${error.message}`)
    }
  }

  /**
   * Unpause contract (Admin only)
   */
  async unpauseContract(): Promise<any> {
    try {
      this.logger.log('Unpausing PerkNFT contract')

      const tx = await this.contract.unpause()
      const receipt = await tx.wait()

      this.logger.log(`Contract unpaused successfully. Transaction hash: ${receipt.hash}`)

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      }
    } catch (error) {
      this.logger.error(`Failed to unpause contract: ${error.message}`)
      throw new Error(`Failed to unpause contract: ${error.message}`)
    }
  }

  /**
   * Check if contract is connected and accessible
   */
  async checkContractConnection(): Promise<any> {
    try {
      const perkNFTAddress = this.configService.get<string>('blockchain.contract.perkNFT.address')

      if (!perkNFTAddress) {
        throw new Error('PERK_NFT_ADDRESS environment variable is not set')
      }

      // Check if contract is deployed
      const code = await this.provider.getCode(perkNFTAddress)
      if (code === '0x') {
        throw new Error('Contract is not deployed at the specified address')
      }

      return {
        success: true,
        message: 'Contract connection successful',
        address: perkNFTAddress,
      }
    } catch (error) {
      this.logger.error(`Contract connection check failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Check if contract is paused
   */
  async checkContractPauseStatus(): Promise<any> {
    try {
      const isPaused = await this.contract.paused()

      return {
        success: true,
        isPaused,
        message: isPaused ? 'Contract is paused' : 'Contract is not paused',
      }
    } catch (error) {
      this.logger.error(`Failed to check contract pause status: ${error.message}`)
      throw error
    }
  }

  /**
   * Test basic contract functions
   */
  async testContractFunctions(): Promise<any> {
    try {
      const results = {
        contractAddress: await this.contract.getAddress(),
        ownerAddress: await this.contract.owner(),
        baseURI: await this.contract.baseURI(),
        perkManagerAddress: await this.contract.perkManager(),
        isPaused: await this.contract.paused(),
        interfaceSupported: await this.contract.supportsInterface('0x01ffc9a7'), // ERC165
      }

      return {
        ...results,
        message: 'All basic contract functions accessible',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      this.logger.error(`Contract test failed: ${error.message}`)
      throw new Error(`Contract test failed: ${error.message}`)
    }
  }

  /**
   * Check authorization status
   */
  async checkAuthorizationStatus(): Promise<any> {
    try {
      const currentPerkManager = await this.contract.perkManager()
      const signerAddress = await this.signer.getAddress()
      const contractOwner = await this.contract.owner()
      const isAuthorized = currentPerkManager.toLowerCase() === signerAddress.toLowerCase()

      return {
        success: true,
        currentPerkManager,
        signerAddress,
        contractOwner,
        isAuthorized,
        message: isAuthorized ? 'Signer is authorized' : 'Signer is not authorized',
      }
    } catch (error) {
      this.logger.error(`Failed to check authorization status: ${error.message}`)
      throw error
    }
  }

  /**
   * Approve perk for use
   */
  async approvePerk(tokenId: string): Promise<any> {
    try {
      this.logger.log(`Approving perk NFT with tokenId: ${tokenId}`)

      // Get the contract address
      const contractAddress = await this.contract.getAddress()
      const callerAddress = await this.signer.getAddress()

      // Check if already approved
      const isApproved = await this.contract.isApprovedForAll(callerAddress, contractAddress)
      if (isApproved) {
        return {
          success: true,
          message: 'Perk is already approved',
          isApproved: true,
        }
      }

      // Approve the perk
      const tx = await this.contract.setApprovalForAll(contractAddress, true)
      this.logger.log(`Approval transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Approval transaction confirmed in block ${receipt.blockNumber}`)

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        isApproved: true,
        message: 'Perk approved successfully',
      }
    } catch (error) {
      this.logger.error(`Failed to approve perk: ${error.message}`)
      this.logger.error(`Full error:`, error)
      throw new Error(`Failed to approve perk: ${error.message}`)
    }
  }

  /**
   * Check approval status
   */
  async checkApprovalStatus(tokenId: string): Promise<any> {
    try {
      const contractAddress = await this.contract.getAddress()
      const signerAddress = await this.signer.getAddress()

      // Check balance
      const balance = await this.contract.balanceOf(signerAddress, BigInt(tokenId))
      if (balance.toString() === '0') {
        return {
          success: false,
          message: 'User does not own the token',
        }
      }

      // Check approval
      const isApproved = await this.contract.isApprovedForAll(signerAddress, contractAddress)

      return {
        success: true,
        isApproved,
        message: isApproved ? 'Contract is approved' : 'Contract is not approved',
      }
    } catch (error) {
      this.logger.error(`Failed to check approval status: ${error.message}`)
      throw error
    }
  }

  /**
   * Execute perk usage transaction
   * @param tokenId The token ID to use
   * @param userWallet The wallet address of the user using the perk
   * @returns Transaction details
   */
  async executeUsePerk(tokenId: string, userWallet: string): Promise<UsePerkResponse> {
    try {
      // Create UsePerkDto object
      const useDto: UsePerkDto = {
        userWallet: userWallet,
      }

      // Execute the usePerk function
      const checkResult = await this.usePerk(tokenId, useDto)

      return checkResult
    } catch (error) {
      this.logger.error(`Failed to execute perk usage: ${error.message}`)
      throw error
    }
  }

  /**
   * Set approval for user wallet
   */
  async setUserWalletApproval(operator: string, approved: boolean): Promise<any> {
    try {
      this.logger.log(`Setting approval for operator: ${operator}, approved: ${approved}`)

      // Get the caller's address
      const callerAddress = await this.signer.getAddress()
      this.logger.log(`Caller address: ${callerAddress}`)

      // Set approval for the operator
      const tx = await this.contract.setApprovalForAll(operator, approved)
      this.logger.log(`Approval transaction sent: ${tx.hash}`)

      const receipt = await tx.wait()
      this.logger.log(`Approval transaction confirmed in block ${receipt.blockNumber}`)

      return {
        success: true,
        data: {
          operator,
          approved,
          transactionHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
        message: 'Approval set successfully',
      }
    } catch (error) {
      this.logger.error(`Failed to set approval: ${error.message}`)
      this.logger.error(`Full error:`, error)
      throw new Error(`Failed to set approval: ${error.message}`)
    }
  }

  /**
   * Use perk with user wallet (proper implementation)
   * @param tokenId The token ID to use
   * @param userPrivateKey User's private key or signed transaction data
   * @returns Transaction result
   */
  async usePerkWithUserWallet(tokenId: string, userPrivateKey: string): Promise<UsePerkResponse> {
    try {
      const numericTokenId = Number(tokenId)
      this.logger.log(`Using perk NFT with tokenId: ${numericTokenId} using user wallet`)

      // Create user signer
      const userSigner = new ethers.Wallet(userPrivateKey, this.provider)
      const userContract = new ethers.Contract(this.contractAddress, perkNFTAbi, userSigner)

      const userAddress = await userSigner.getAddress()
      this.logger.log(`User wallet address: ${userAddress}`)

      // Validate ownership
      const balance = await userContract.balanceOf(userAddress, numericTokenId)
      if (balance.toString() === '0') {
        throw new Error('User does not own this perk NFT')
      }

      // Get remaining uses before
      const remainingUsesBefore = await userContract.getRemainingUses(numericTokenId)

      // Execute usePerk transaction
      const tx = await userContract.usePerk(numericTokenId)
      this.logger.log(`Transaction hash: ${tx.hash}`)

      // Wait for confirmation
      const receipt = await tx.wait()
      this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`)

      // Get remaining uses after
      let remainingUsesAfter = '0'
      try {
        remainingUsesAfter = await userContract.getRemainingUses(numericTokenId)
      } catch (error) {
        // Token might be burned after use
        this.logger.log('Token may have been burned after use')
      }

      return {
        success: true,
        tokenId: numericTokenId.toString(),
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
        action: 'used',
        remainingUsesBefore: remainingUsesBefore.toString(),
        remainingUsesAfter: remainingUsesAfter.toString(),
      }
    } catch (error) {
      this.logger.error(`Failed to use perk with user wallet: ${error.message}`)
      throw new Error(`Failed to use perk with user wallet: ${error.message}`)
    }
  }
}
