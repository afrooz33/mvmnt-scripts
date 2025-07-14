import { ApiProperty } from '@nestjs/swagger'

export class AdminTokenDto {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly email: string

  @ApiProperty()
  readonly role: string
}
