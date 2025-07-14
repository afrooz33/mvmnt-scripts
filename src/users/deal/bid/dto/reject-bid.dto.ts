import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RejectBidDto {
  @ApiProperty({
    isArray: true,
    description: 'Bid ids',
    example: ['bidId1', 'bidId2'],
  })
  @IsNotEmpty()
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  readonly bidIds: string[]

  @ApiPropertyOptional({
    description: 'Rejection reason',
    example: 'Invalid bid amount',
  })
  @IsOptional()
  readonly reject_reason?: string
}
