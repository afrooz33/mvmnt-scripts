import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'

export class NumberOfFollowerProperty {
  @ApiPropertyOptional({
    name: 'follower[start]',
  })
  @IsOptional()
  @IsNumber()
  readonly start: string

  @ApiPropertyOptional({
    name: 'follower[end]',
  })
  @IsOptional()
  @IsNumber()
  readonly end: string
}
