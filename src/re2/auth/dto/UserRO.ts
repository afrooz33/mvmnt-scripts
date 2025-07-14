import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { JwtDto } from '@app/src/shared/auth/dto'
import { AccountType } from '@app/src/shared/auth/enums'

export class UserRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly email: string

  @ApiProperty({ enum: AccountType })
  readonly account_type: AccountType

  @ApiPropertyOptional({ type: JwtDto })
  readonly jwt?: JwtDto
}
