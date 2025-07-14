import { ApiProperty } from '@nestjs/swagger'
import { AccountType } from '@app/src/shared/auth/enums'

export class UserDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty({ enum: AccountType })
  readonly account_type: AccountType

  @ApiProperty()
  readonly email: string

  @ApiProperty()
  readonly created: Date

  @ApiProperty()
  readonly updated: Date
}
