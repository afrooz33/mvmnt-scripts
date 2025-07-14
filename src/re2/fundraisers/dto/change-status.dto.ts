import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { FundraiserChangeStatus } from '@app/src/re2/fundraisers/enums'

export class FundraiserChangeStatusDto {
  @ApiProperty({
    description: 'Change status',
    enum: Object.values(FundraiserChangeStatus),
    default: FundraiserChangeStatus.DISABLED,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(FundraiserChangeStatus)
  readonly status: FundraiserChangeStatus
}
