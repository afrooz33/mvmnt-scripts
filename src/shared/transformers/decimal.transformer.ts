import { ValueTransformer } from 'typeorm'
import { BigNumber } from 'bignumber.js'

export default class DecimalTransformer implements ValueTransformer {
  to(value: BigNumber | null | undefined): string | null {
    return value?.toString() ?? null
  }

  from(value: string): BigNumber {
    return new BigNumber(value)
  }
}
