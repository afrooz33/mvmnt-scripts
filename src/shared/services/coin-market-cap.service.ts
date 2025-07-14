import axios from 'axios'
import BigNumber from 'bignumber.js'
import { ConfigService } from '@nestjs/config'
import { Injectable, Logger } from '@nestjs/common'
import { TokensService } from '@app/src/admin/tokens/tokens.service'
import { TokenWhitelistEntity } from '@app/src/admin/tokens/entities/whitelist-tokens.entity'

@Injectable()
export class CoinMarketCapService {
  private apiKey: string
  private baseURL: string = 'https://pro-api.coinmarketcap.com/v2/'
  private priceConversion: string = 'tools/price-conversion'
  private readonly logger = new Logger(CoinMarketCapService.name)

  constructor(
    private readonly configService: ConfigService,
    protected readonly tokensService: TokensService,
  ) {
    this.apiKey = this.configService.get('blockchain.coinMarketCapKey')
  }

  async getFromCMC(params: Record<string, string>, coinMarketCapID: number) {
    const url = `${this.baseURL}${this.priceConversion}?${new URLSearchParams(params).toString()}`

    try {
      const response = await axios.get(url, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          Accept: 'application/json',
        },
      })

      if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data.quote &&
        response.data.data.quote[coinMarketCapID.toString()]
      ) {
        return response.data.data.quote[coinMarketCapID.toString()].price
      } else if (
        response &&
        response.data &&
        response.data.data &&
        response.data.data[params.id] &&
        response.data.data[params.id].quote &&
        response.data.data[params.id].quote[params.convert]
      ) {
        return response.data.data[params.id].quote[params.convert].price
      }

      this.logger.warn(
        `Price data not found in CoinMarketCap response for params: ${JSON.stringify(
          params,
        )} and target CMC ID: ${coinMarketCapID}. Response: ${JSON.stringify(response.data)}`,
      )

      return null
    } catch (error) {
      this.logger.error(`Error calling CoinMarketCap API at ${url}: ${error.message}`, error.stack)

      if (error.response) {
        this.logger.error(`CoinMarketCap Error Response: ${JSON.stringify(error.response.data)}`)
      }

      throw error
    }
  }

  async getEthToBaseRate() {
    const toToken = this.tokensService.getETHToken()
    const fromToken = this.tokensService.getBaseToken()

    const params = {
      amount: '1',
      id: fromToken.coin_market_cap_id.toString(),
      convert_id: toToken.coin_market_cap_id.toString(),
    }

    return await this.getFromCMC(params, toToken.coin_market_cap_id)
  }

  async conversionRateFromBase(toCurrency: string | TokenWhitelistEntity) {
    const toToken: TokenWhitelistEntity =
      toCurrency instanceof TokenWhitelistEntity
        ? toCurrency
        : await this.tokensService.getTokenInfo(toCurrency)
    const fromToken = this.tokensService.getBaseToken()

    const params = {
      amount: '1',
      id: fromToken.coin_market_cap_id.toString(),
      convert_id: toToken.coin_market_cap_id.toString(),
    }

    return await this.getFromCMC(params, toToken.coin_market_cap_id)
  }

  async getConversionRate(fromCurrency: string, toCurrency: string) {
    const tokenDetails = await this.tokensService.getTokensInfo([fromCurrency, toCurrency])
    const toToken: TokenWhitelistEntity = tokenDetails[toCurrency]
    const fromToken: TokenWhitelistEntity = tokenDetails[fromCurrency]

    const params = {
      amount: '1',
      id: fromToken.coin_market_cap_id.toString(),
      convert_id: toToken.coin_market_cap_id.toString(),
    }

    return await this.getFromCMC(params, toToken.coin_market_cap_id)
  }

  async convertCurrency(fromCurrency: string, toCurrency: string, amount: BigNumber) {
    const tokenDetails = await this.tokensService.getTokensInfo([fromCurrency, toCurrency])
    const toToken: TokenWhitelistEntity = tokenDetails[toCurrency]
    const fromToken: TokenWhitelistEntity = tokenDetails[fromCurrency]

    const params = {
      amount: amount.toString(),
      id: fromToken.coin_market_cap_id.toString(),
      convert_id: toToken.coin_market_cap_id.toString(),
    }

    return await this.getFromCMC(params, toToken.coin_market_cap_id)
  }

  async convertToken(
    fromToken: TokenWhitelistEntity,
    toToken: TokenWhitelistEntity,
    amount: BigNumber,
  ) {
    const params = {
      amount: amount.toString(),
      id: fromToken.coin_market_cap_id.toString(),
      convert_id: toToken.coin_market_cap_id.toString(),
    }

    return await this.getFromCMC(params, toToken.coin_market_cap_id)
  }

  /**
   * Gets the conversion rate of 1 unit of a cryptocurrency to a specified fiat currency.
   * @param cryptoSymbol Symbol of the cryptocurrency (e.g., "ETH", "BTC").
   * @param fiatSymbol Symbol of the fiat currency (e.g., "USD", "EUR"). Defaults to "USD".
   * @returns The price of 1 unit of cryptoSymbol in fiatSymbol as a BigNumber.
   */
  async getCryptoToFiatRate(cryptoSymbol: string, fiatSymbol: string = 'USD'): Promise<BigNumber> {
    const cryptoToken = await this.tokensService.getTokenInfoBySymbol(cryptoSymbol)

    if (!cryptoToken || !cryptoToken.coin_market_cap_id) {
      this.logger.error(`CoinMarketCap ID not found for crypto: ${cryptoSymbol}`)
      throw new Error(`CoinMarketCap ID not found for crypto: ${cryptoSymbol}`)
    }

    const params = {
      amount: '1',
      id: cryptoToken.coin_market_cap_id.toString(),
      convert: fiatSymbol,
    }

    const url = `${this.baseURL}${this.priceConversion}?${new URLSearchParams(params).toString()}`
    try {
      const response = await axios.get(url, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          Accept: 'application/json',
        },
      })

      if (
        response.data &&
        response.data.data &&
        response.data.data.quote &&
        response.data.data.quote[fiatSymbol] &&
        response.data.data.quote[fiatSymbol].price !== undefined
      ) {
        const price = response.data.data.quote[fiatSymbol].price
        return new BigNumber(price)
      } else {
        this.logger.error(
          `Failed to parse ${cryptoSymbol} to ${fiatSymbol} rate from CoinMarketCap. Params: ${JSON.stringify(
            params,
          )}`,
          JSON.stringify(response.data),
        )
        throw new Error(
          `Could not find price or unexpected API response structure for ${cryptoSymbol} in ${fiatSymbol} from CoinMarketCap.`,
        )
      }
    } catch (error) {
      this.logger.error(
        `Error fetching crypto to fiat rate for ${cryptoSymbol} to ${fiatSymbol}: ${error.message}`,
        error.stack,
      )
      if (error.response) {
        this.logger.error(`CoinMarketCap Error Response: ${JSON.stringify(error.response.data)}`)
      }
      throw error
    }
  }

  /**
   * Converts a specific amount of a cryptocurrency to its equivalent in a fiat currency.
   * @param cryptoSymbol Symbol of the cryptocurrency (e.g., "ETH").
   * @param fiatSymbol Symbol of the fiat currency (e.g., "USD"). Defaults to "USD".
   * @param amount The amount of cryptoSymbol to convert.
   * @returns The equivalent amount in fiatSymbol as a BigNumber.
   */
  async convertCryptoToFiatAmount(
    cryptoSymbol: string,
    amount: BigNumber,
    fiatSymbol: string = 'USD',
  ): Promise<BigNumber> {
    const cryptoToken = await this.tokensService.getTokenInfoBySymbol(cryptoSymbol)

    if (!cryptoToken || !cryptoToken.coin_market_cap_id) {
      this.logger.error(
        `CoinMarketCap ID not found for crypto: ${cryptoSymbol} for amount conversion.`,
      )
      throw new Error(`CoinMarketCap ID not found for crypto: ${cryptoSymbol}`)
    }

    const params = {
      amount: amount.toString(),
      id: cryptoToken.coin_market_cap_id.toString(),
      convert: fiatSymbol,
    }

    const url = `${this.baseURL}${this.priceConversion}?${new URLSearchParams(params).toString()}`
    try {
      const response = await axios.get(url, {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKey,
          Accept: 'application/json',
        },
      })

      if (
        response.data &&
        response.data.data &&
        response.data.data.quote &&
        response.data.data.quote[fiatSymbol] &&
        response.data.data.quote[fiatSymbol].price !== undefined
      ) {
        const convertedAmount = response.data.data.quote[fiatSymbol].price
        return new BigNumber(convertedAmount)
      } else {
        this.logger.error(
          `Failed to parse converted amount for ${amount} ${cryptoSymbol} to ${fiatSymbol} from CoinMarketCap. Params: ${JSON.stringify(
            params,
          )}`,
          JSON.stringify(response.data),
        )
        throw new Error(
          `Could not find converted amount or unexpected API response structure for ${cryptoSymbol} to ${fiatSymbol} from CoinMarketCap.`,
        )
      }
    } catch (error) {
      this.logger.error(
        `Error fetching crypto to fiat amount for ${cryptoSymbol} to ${fiatSymbol}: ${error.message}`,
        error.stack,
      )
      if (error.response) {
        this.logger.error(`CoinMarketCap Error Response: ${JSON.stringify(error.response.data)}`)
      }
      throw error
    }
  }
}
