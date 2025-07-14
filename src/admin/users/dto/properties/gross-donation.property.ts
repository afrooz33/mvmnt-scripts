import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'

export class GrossDonationProperty {
  @ApiPropertyOptional({
    name: 'gross_donation[start]',
  })
  @IsOptional()
  @IsNumber()
  readonly start: string

  @ApiPropertyOptional({
    name: 'gross_donation[end]',
  })
  @IsOptional()
  @IsNumber()
  readonly end: string
}
