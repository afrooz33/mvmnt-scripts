import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class NonprofitFundsDto {
  @ApiProperty({
    description: 'Address of the Donation Project',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly donation_project: string

  @ApiProperty({
    description: 'Address of the Token',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  readonly token: string

  @ApiProperty({
    description: 'Timestamp used in signature',
    example: '1734685102985',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  readonly timestamp: number
}
