import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

export class SellerMonthPaidHistoryDto {
  @ApiProperty({
    description: 'year',
  })
  @IsNotEmpty()
  readonly year: number

  @ApiProperty({
    description: 'month',
  })
  @IsNotEmpty()
  readonly month: number

  @ApiPropertyOptional({
    description: 'Group by resellers',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ obj, key }) => {
    const value = obj[key]

    if (typeof value === 'string') {
      return obj[key] === 'true'
    }

    return value
  })
  readonly by_resellers: boolean
}
