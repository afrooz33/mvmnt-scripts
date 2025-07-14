import { VerificationStatus } from '@app/src/users/profile/enums'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum, IsNotEmpty, IsDefined } from 'class-validator'

export class ProfileReviewDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ApiPropertyOptional({
    description: 'Profile review status',
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.DECLINED,
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  readonly verification_status: VerificationStatus

  @ApiPropertyOptional({
    description: 'Admin memo',
    default: '',
  })
  @IsOptional()
  @IsString()
  readonly admin_memo?: string
}
