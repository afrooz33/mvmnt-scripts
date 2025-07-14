import { ApiProperty } from '@nestjs/swagger'
import { UserDto } from '@app/src/shared/dto'

export class ProfileRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly first_name: string

  @ApiProperty()
  readonly last_name: string

  @ApiProperty()
  readonly notification_email: string

  @ApiProperty()
  readonly company_name: string

  @ApiProperty()
  readonly phone: string

  @ApiProperty({ type: UserDto })
  readonly user: UserDto
}
