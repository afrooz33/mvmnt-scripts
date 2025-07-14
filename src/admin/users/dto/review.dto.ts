import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsEnum, IsDefined, IsNotEmpty } from 'class-validator'
import { AccountStatus } from '@app/src/users/user/enums'

export class ReviewDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ApiPropertyOptional({
    description: 'User review status',
    enum: Object.values(AccountStatus),
    default: AccountStatus.UNDER_REVIEW,
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  readonly status: AccountStatus

  @ApiPropertyOptional({
    description: 'Admin memo',
    default: '',
  })
  @IsOptional()
  @IsString()
  readonly admin_memo?: string
}
