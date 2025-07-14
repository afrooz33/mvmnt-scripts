import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class CheckBTResponseDto {
  @ApiProperty({
    description: 'Has minimum required Buy Now deals',
    example: true,
  })
  @IsBoolean()
  readonly has_minimum_deals: boolean

  @ApiProperty({
    description: 'Has required membership level (Gold or above)',
    example: false,
  })
  @IsBoolean()
  readonly has_required_rank: boolean

  @ApiProperty({
    description: 'Has completed identity verification',
    example: true,
  })
  @IsBoolean()
  readonly has_completed_verification: boolean

  @ApiProperty({
    description: 'Has admin approval for brand tokens',
    example: false,
  })
  @IsBoolean()
  readonly has_admin_approval: boolean

  @ApiProperty({
    description: 'Overall eligibility status',
    example: false,
  })
  @IsBoolean()
  readonly is_eligible: boolean
}
