import { Column } from 'typeorm'
import { IsDecimal } from 'class-validator'

export class PriceRange {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsDecimal({ decimal_digits: '1,2' })
  start: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsDecimal({ decimal_digits: '1,2' })
  end: number
}
