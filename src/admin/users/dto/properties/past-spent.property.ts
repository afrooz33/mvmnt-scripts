import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'

export class PastSpentProperty {
  @ApiPropertyOptional({
    name: 'past_spent[start]',
  })
  @IsOptional()
  @IsNumber()
  readonly start: string

  @ApiPropertyOptional({
    name: 'past_spent[end]',
  })
  @IsOptional()
  @IsNumber()
  readonly end: string
}
