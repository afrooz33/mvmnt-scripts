import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, Matches, IsDefined, IsOptional, IsNotEmpty, IsUUID } from 'class-validator'
import { Status } from '@app/src/shared/enums'

export enum RewardStatus {
  PENDING = Status.PENDING,
  ACQUIRED = Status.ACQUIRED,
}

export class QueryRewardHistoryDto {
  @ApiPropertyOptional({ description: 'Filter by deal ID' })
  @IsUUID()
  @IsOptional()
  deal?: string

  @ApiPropertyOptional({ description: 'Filter by year (YYYY)' })
  @IsOptional()
  @Matches(/^(19|20)\d{2}$/, { message: 'Year should be a valid 4-digit year' })
  year?: string

  @ApiPropertyOptional({ description: 'Filter by month (MM)' })
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Month should be a valid 2-digit month (01-12)' })
  month?: string

  @ApiProperty({
    description: 'Filter by reward status (PENDING/ACQUIRED)',
    enum: RewardStatus,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(RewardStatus)
  status: RewardStatus
}
