import { NonprofitProfileStatus } from '@app/src/nonprofit/profile/enums'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum } from 'class-validator'

export class NonprofitProfileReviewDto {
  @ApiPropertyOptional({
    description: 'Profile review status',
    enum: Object.values(NonprofitProfileStatus),
    default: NonprofitProfileStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(NonprofitProfileStatus)
  readonly status: NonprofitProfileStatus

  @ApiPropertyOptional({
    description: 'Admin memo',
    default: '',
  })
  @IsOptional()
  @IsString()
  readonly admin_memo?: string
}
