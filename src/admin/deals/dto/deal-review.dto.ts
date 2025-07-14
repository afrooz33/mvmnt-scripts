import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { DealStatus } from '@app/src/users/deal/enums'

export class DealReviewDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty({
    description: 'Deal status',
    default: DealStatus.ON_DEAL,
    enum: Object.values(DealStatus),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(DealStatus)
  readonly status: DealStatus

  @ApiPropertyOptional({
    description: 'Admin memo',
    default: '',
  })
  @IsOptional()
  @IsString()
  readonly admin_memo?: string
}
