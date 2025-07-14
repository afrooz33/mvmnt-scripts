import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { DateFilterQueryDto } from './date-filter-query.dto'

export class AgeGenderFilterQueryDto extends DateFilterQueryDto {
  @ApiPropertyOptional({
    description: 'User account type',
    enum: ['INDIVIDUAL_INFLUENCER', 'INDIVIDUAL_PERSONAL'],
  })
  @IsOptional()
  readonly account_type?: ['INDIVIDUAL_INFLUENCER', 'INDIVIDUAL_PERSONAL']
}
