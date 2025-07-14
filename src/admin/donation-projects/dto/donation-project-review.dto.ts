import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum, MaxLength, IsDefined, IsNotEmpty } from 'class-validator'
import { DonationProjectReviewStatus } from '@app/src/nonprofit/donation-projects/enums'

export class DonationProjectReviewDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ApiPropertyOptional({
    description: 'Donation project review status',
    enum: Object.values(DonationProjectReviewStatus),
    default: DonationProjectReviewStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(DonationProjectReviewStatus)
  readonly review_status: DonationProjectReviewStatus

  @ApiPropertyOptional({
    description: 'Admin memo',
    default: '',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly admin_memo?: string
}
