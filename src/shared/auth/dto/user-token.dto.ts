import { ApiProperty } from '@nestjs/swagger'

export class UserTokenDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly email: string

  @ApiProperty()
  readonly account_type: string

  @ApiProperty()
  readonly two_factor_enabled: boolean

  @ApiProperty()
  readonly token: string
}
