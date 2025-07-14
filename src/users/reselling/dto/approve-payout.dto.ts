import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class ApprovePayoutDto {
  @ApiProperty({
    description: 'Reseller id',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly reseller: string

  @ApiProperty({
    description: 'Payout id',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly reward: string

  @ApiProperty({
    description: 'Reason for approval',
  })
  @IsString()
  @IsNotEmpty()
  readonly memo: string
}
