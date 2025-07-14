import { DonationProjectReviewStatus } from '@app/src/nonprofit/donation-projects/enums'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum } from 'class-validator'

export class ReviewDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiPropertyOptional({
    description: 'Donation project review status',
    enum: Object.values(DonationProjectReviewStatus),
    default: DonationProjectReviewStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(DonationProjectReviewStatus)
  readonly status: DonationProjectReviewStatus

  @ApiPropertyOptional({
    description: 'Admin memo',
    default: '',
  })
  @IsOptional()
  @IsString()
  readonly admin_memo?: string
}
