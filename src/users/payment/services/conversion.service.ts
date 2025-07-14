import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'
import { CoinMarketCapService } from '@app/src/shared/services/coin-market-cap.service'
import { Injectable } from '@nestjs/common'
import BigNumber from 'bignumber.js'

@Injectable()
export class CryptoConversionService {
  constructor(private readonly coinMarketCapService: CoinMarketCapService) {}

  getCryptoShares = async (
    dealAmount: BigNumber,
    donationAmount: BigNumber,
    currency: string | TokenWhitelistEntity,
  ) => {
    //  1. Get conversion rate for the currency
    const conversionRate = await this.coinMarketCapService.conversionRateFromBase(currency)

    //  2. Calculate the Shares for Admin and Donation
    const adminShare = dealAmount.multipliedBy(conversionRate)
    const donationShare = donationAmount.multipliedBy(conversionRate)

    return {
      adminShare,
      donationShare,
    }
  }
}
