import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { BrandTokenRequestEntity } from '@app/src/brand-tokens/entities/brand-token-request.entity'
import { BrandTokenDetailsDto } from '@app/src/brand-tokens/dto'
import { BrandTokenEntity } from '@app/src/brand-tokens/entities/brand-token.entity'
import { BrandTokenOfferingEntity } from '@app/src/brand-tokens/entities/brand-token-offering.entity'
import { BrandTokenOfferingPhaseEntity } from '@app/src/brand-tokens/entities/brand-token-offering-phase.entity'
import { ConfigService } from '@nestjs/config'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { BrandTokenPhaseWhitelistEntity } from '@app/src/brand-tokens/entities/brand-token-phase-whitelist.entity'
import { BrandTokenPhaseParticipantEntity } from '@app/src/brand-tokens/entities/brand-token-phase-participant.entity'
import { ImagesService } from '@app/src/images/images.service'
import {
  getPhaseDetailsService,
  getPhaseWhitelistService,
  getPhaseParticipantsService,
  getUserParticipationsService,
  claimTokensService,
  showOfferingsService,
  createOfferingService,
  createPhaseService,
  createBrandTokenService,
  createBTRequestService,
  showBTRequestService,
  searchUsersService,
  addToWhitelistService,
  purchaseTokensService,
} from './services'
import { ErrorKey } from '@app/src/shared/enums'
import { PaymentWalletsEntity } from '@app/src/users/payment-method/entities/payment-wallets.entity'
import { BrandManagerService } from '@app/src/blockchain/services/brand-manager.service'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'

@Injectable()
export class BrandTokensService extends MyService<BrandTokenRequestEntity> {
  constructor(
    @InjectRepository(BrandTokenRequestEntity)
    protected readonly btRequestRepository: Repository<BrandTokenRequestEntity>,
    @InjectRepository(BrandEntity)
    protected readonly brandRepository: Repository<BrandEntity>,
    @InjectRepository(BrandTokenEntity)
    private readonly brandTokenRepository: Repository<BrandTokenEntity>,
    @InjectRepository(BrandTokenOfferingEntity)
    private readonly offeringRepository: Repository<BrandTokenOfferingEntity>,
    @InjectRepository(BrandTokenOfferingPhaseEntity)
    private readonly offeringPhaseRepository: Repository<BrandTokenOfferingPhaseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    @InjectRepository(BrandTokenPhaseWhitelistEntity)
    private readonly phaseWhitelistRepository: Repository<BrandTokenPhaseWhitelistEntity>,
    @InjectRepository(BrandTokenPhaseParticipantEntity)
    private readonly phaseParticipantRepository: Repository<BrandTokenPhaseParticipantEntity>,
    @InjectRepository(PaymentWalletsEntity)
    private readonly paymentWalletRepository: Repository<PaymentWalletsEntity>,
    private readonly imagesService: ImagesService,
    private readonly brandManagerService: BrandManagerService,
  ) {
    super(btRequestRepository, 'users/brand-tokens')
  }

  // Bind methods
  searchUsers = searchUsersService.bind(this)
  addToWhitelist = addToWhitelistService.bind(this)
  purchaseTokens = purchaseTokensService.bind(this)
  getPhaseDetails = getPhaseDetailsService.bind(this)
  getPhaseWhitelist = getPhaseWhitelistService.bind(this)
  getPhaseParticipants = getPhaseParticipantsService.bind(this)
  getUserParticipations = getUserParticipationsService.bind(this)
  claimTokens = claimTokensService.bind(this)
  createBTRequest = createBTRequestService.bind(this)
  showBTRequest = showBTRequestService.bind(this)
  createDetails = createBrandTokenService.bind(this)
  showOfferings = showOfferingsService.bind(this)
  createOffering = createOfferingService.bind(this)
  createPhase = createPhaseService.bind(this)

  private uuidToNumberString(uuid: string) {
    // Remove hyphens from the UUID
    const cleanUuid = uuid.replace(/-/g, '')

    // Take only the first 16 characters (64 bits) to ensure it fits in uint64
    const truncatedUuid = cleanUuid.slice(0, 16)

    return '0x' + truncatedUuid
  }

  private async createTokenOnBlockchain(
    request: BrandTokenRequestEntity,
    payload: BrandTokenDetailsDto,
    wallet: PaymentWalletsEntity,
  ): Promise<string> {
    try {
      const tokenAddress = await this.brandManagerService.createToken(
        this.uuidToNumberString(request.user.id),
        payload.name,
        payload.symbol,
        wallet.address,
      )

      // Check if token address is already in use
      const existingToken = await this.brandTokenRepository.findOne({
        where: { contract_address: tokenAddress },
        select: ['id'],
      })

      if (existingToken) {
        throw new BadRequestException(ErrorKey.TOKEN_ALREADY_EXISTS)
      }

      return tokenAddress
    } catch (error) {
      throw new BadRequestException('Failed to create token on blockchain: ' + error.message)
    }
  }
}
