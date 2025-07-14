import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsString, IsOptional, IsNotEmpty } from 'class-validator'
import { BidStatus } from '@app/src/users/deal/bid/enums'

export class BidderDto {
  @ApiPropertyOptional({
    description: 'Page',
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiPropertyOptional({
    description: 'Results per page',
    default: 10,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly limit?: string

  @ApiPropertyOptional({
    isArray: true,
    description: 'Bid status',
    enum: Object.values(BidStatus),
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(BidStatus, { each: true })
  readonly status?: BidStatus[]
}
