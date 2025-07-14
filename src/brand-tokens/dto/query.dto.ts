import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsEnum } from 'class-validator'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'

export class BrandTokenQueryDto {
  @ApiPropertyOptional({
    enum: BrandTokenRequestStatus,
    description: 'Filter by request status',
  })
  @IsOptional()
  @IsEnum(BrandTokenRequestStatus)
  readonly status?: BrandTokenRequestStatus
}
