import { ApiProperty } from '@nestjs/swagger'

export class JwtDto {
  @ApiProperty()
  readonly type: string

  @ApiProperty({ description: 'The short lived access token' })
  readonly jwt: string

  @ApiProperty({ description: 'The long lived refresh token' })
  readonly refresh_token: string
}
