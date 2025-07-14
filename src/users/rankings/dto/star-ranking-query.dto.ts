import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum } from 'class-validator'
import { StarEarningHistoryDto } from './star-earning-history.dto'

export class StarRankingQueryDto extends StarEarningHistoryDto {
  @ApiProperty({
    description: 'Filter by user type either INDIVIDUAL or BUSINESS',
    enum: ['INDIVIDUAL', 'BUSINESS'],
    type: String,
  })
  @IsDefined()
  @IsEnum(['INDIVIDUAL', 'BUSINESS'])
  readonly user_type: 'INDIVIDUAL' | 'BUSINESS'
}
