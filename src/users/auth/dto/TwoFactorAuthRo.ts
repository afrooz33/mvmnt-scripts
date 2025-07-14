import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator'

export class TwoFactorAuthRO {
  @ApiProperty()
  readonly secret: string

  @ApiProperty()
  readonly qr_code: string

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  readonly recovery_codes?: string[]
}
