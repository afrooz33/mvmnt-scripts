import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class ReinstateResellerDto {
  @ApiProperty({
    description: 'Reseller id',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly reseller: string

  @ApiProperty({
    description: 'Reason for reinstate',
  })
  @IsString()
  @IsNotEmpty()
  readonly memo: string
}
