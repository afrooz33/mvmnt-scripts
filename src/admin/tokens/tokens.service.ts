import { In, Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { ErrorKey } from '@app/src/shared/enums'
import { MyService } from '@app/src/shared/base'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import {
  showService,
  createService,
  validateTokenService,
  updateWhitelistService,
} from './services'

@Injectable()
export class TokensService extends MyService<TokenWhitelistEntity> {
  private MVMNToken: TokenWhitelistEntity
  private BaseToken: TokenWhitelistEntity
  private EthToken: TokenWhitelistEntity

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TokenWhitelistEntity)
    protected readonly tokenWhitelistRepository: Repository<TokenWhitelistEntity>,
    protected readonly regionSettingsService: RegionSettingsService,
  ) {
    super(tokenWhitelistRepository, 'admin/tokens')
  }

  async onModuleInit() {
    //  Get details of the most used tokens when system starts
    const MVMNTAddress = this.configService.get('blockchain.MVMNTAddress')
    const ethToken = this.configService.get('blockchain.ETHAddress')
    const regionSettings = await this.regionSettingsService.find()

    const baseToken = regionSettings[SettingName.BASE_CURRENCY]

    this.tokenWhitelistRepository
      .find({
        where: {
          address: In([MVMNTAddress, baseToken, ethToken]),
        },
      })
      .then((tokenInfo: TokenWhitelistEntity[]) => {
        for (const token of tokenInfo) {
          if (token.address === MVMNTAddress) this.MVMNToken = token
          else if (token.address === baseToken) this.BaseToken = token
          else if (token.address === ethToken) this.EthToken = token
        }
      })
  }

  getTokensIds = async (tokenAddresses: string[]) => {
    //  1. Get Token IDs for given currencies
    const tokens = await this.tokenWhitelistRepository.find({
      where: {
        address: In(tokenAddresses),
      },
      select: ['address', 'id'],
    })

    if (tokens.length != tokenAddresses.length) {
      throw new NotFoundException(ErrorKey.CURRENCY_NOT_FOUND)
    }

    //  2. Convert it to an Object
    const tokenIds = {}
    for (const token of tokens) {
      tokenIds[token.address] = token.id
    }

    return tokenIds
  }

  getMVMVNTToken = (): TokenWhitelistEntity => {
    return this.MVMNToken
  }

  getETHToken = (): TokenWhitelistEntity => {
    return this.EthToken
  }

  getTokenInfo = async (
    tokenAddress: string | TokenWhitelistEntity,
  ): Promise<TokenWhitelistEntity> => {
    if (tokenAddress instanceof TokenWhitelistEntity) return tokenAddress

    return await this.tokenWhitelistRepository.findOne({
      where: {
        address: tokenAddress,
      },
    })
  }

  getTokenInfoBySymbol = async (tokenSymbol: string): Promise<TokenWhitelistEntity> => {
    return await this.tokenWhitelistRepository.findOne({
      where: {
        name: tokenSymbol,
      },
    })
  }

  getTokensInfo = async (tokenAddresses: string[]) => {
    //  1. Get Token IDs for given currencies
    const tokens = await this.tokenWhitelistRepository.find({
      where: {
        address: In(tokenAddresses),
      },
    })

    if (tokens.length != tokenAddresses.length) {
      throw new Error(ErrorKey.CURRENCY_NOT_FOUND)
    }

    //  2. Convert it to an Object
    const tokenIds = {}
    for (const token of tokens) {
      tokenIds[token.address] = token.id
    }

    return tokenIds
  }

  getBaseToken = (): TokenWhitelistEntity => {
    return this.BaseToken
  }

  /**
   * @description Bind methods to the service
   */
  show = showService.bind(this)
  create = createService.bind(this)
  validateToken = validateTokenService.bind(this)
  updateWhitelist = updateWhitelistService.bind(this)
}
