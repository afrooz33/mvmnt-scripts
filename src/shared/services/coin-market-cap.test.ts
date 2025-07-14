import { Test } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { rootConfig } from '@app/config'
import { CoinMarketCapService } from './coin-market-cap.service'
import BigNumber from 'bignumber.js'

describe('Coin Market Cap', () => {
  let coinMarketCapService: CoinMarketCapService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(rootConfig)],
      providers: [CoinMarketCapService],
    }).compile()

    coinMarketCapService = moduleRef.get<CoinMarketCapService>(CoinMarketCapService)
  })

  describe('Convert Currency', () => {
    it('Different Currency: Input != Output', async () => {
      const amount = 1
      const input = {
        fromCurrency: 'USD',
        toCurrency: 'ETH',
        amount: BigNumber(amount),
      }

      const output = await coinMarketCapService.convertCurrency(
        input.fromCurrency,
        input.toCurrency,
        input.amount,
      )

      expect(output).not.toEqual(input.amount.toNumber())
    })

    it('Same Currency: Input == Output', async () => {
      const amount = 1
      const input = {
        fromCurrency: 'USD',
        toCurrency: 'USD',
        amount: BigNumber(amount),
      }

      const output = await coinMarketCapService.convertCurrency(
        input.fromCurrency,
        input.toCurrency,
        input.amount,
      )

      expect(output).toEqual(input.amount.toNumber())
    })
  })

  describe('Get Conversion Rate', () => {
    it('USD to ETH < 0.001', async () => {
      const input = {
        fromCurrency: 'USD',
        toCurrency: 'ETH',
      }

      const output = await coinMarketCapService.getConversionRate(
        input.fromCurrency,
        input.toCurrency,
      )

      expect(output).toBeLessThan(0.001)
    })

    it('USD to USD = 1', async () => {
      const input = {
        fromCurrency: 'USD',
        toCurrency: 'USD',
      }

      const output = await coinMarketCapService.getConversionRate(
        input.fromCurrency,
        input.toCurrency,
      )

      expect(output).toEqual(1)
    })
  })

  describe('Convert from base', () => {
    it('Converts ETH', async () => {
      const input = 'ETH'
      const output = await coinMarketCapService.conversionRateFromBase(input)
      expect(output).toBeLessThan(0.001)
    })

    it('Does not convert Base', async () => {
      const input = '0xfeeC6DaC9595dD9B4C54E0a7203499009d6cbfF8'
      console.log('Input', input)
      const output = await coinMarketCapService.conversionRateFromBase(input)
      expect(output).toEqual(1)
    })
  })
})
