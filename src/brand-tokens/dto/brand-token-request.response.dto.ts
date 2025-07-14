import { ApiProperty } from '@nestjs/swagger'
import { BrandTokenRequestStatus } from '@app/src/brand-tokens/enums'
import { IsUUID, IsEnum, IsDateString, IsString, MaxLength } from 'class-validator'

export class BTRequestResponseDto {
  @ApiProperty({
    description: 'Request ID',
    example: 'uuid',
    format: 'uuid',
  })
  @IsUUID()
  readonly id: string

  @ApiProperty({
    description: 'Request status',
    enum: BrandTokenRequestStatus,
  })
  @IsEnum(BrandTokenRequestStatus)
  readonly status: BrandTokenRequestStatus

  @ApiProperty({
    description: 'Reason for request',
    example: 'Want to create tokens for my fashion brand',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000, { message: 'Reason cannot exceed 1000 characters' })
  readonly reason: string

  @ApiProperty({
    description: 'Admin notes on request',
    example: 'Approved after verification',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500, { message: 'Admin notes cannot exceed 500 characters' })
  readonly admin_notes: string

  @ApiProperty({
    description: 'Request creation date',
    example: '2024-03-20T10:00:00Z',
  })
  @IsDateString()
  readonly created: Date

  @ApiProperty({
    description: 'Request approval date',
    example: '2024-03-21T15:30:00Z',
  })
  @IsDateString()
  readonly approved_at: Date

  @ApiProperty({
    description: 'Request rejection date',
    example: '2024-03-21T15:30:00Z',
  })
  @IsDateString()
  readonly rejected_at: Date
}
